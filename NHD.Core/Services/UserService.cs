
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using NHD.Core.Models;
using NHD.Core.Repository.Users;
using NHD.Core.Services.Model;
using NHD.Core.Common.Models;
using NHD.Core.Utilities;

namespace NHD.Core.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUsersCodeRepository _usersCodeRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<UserService> _logger;

        private readonly ExpirySettings _expirySettings;



        public UserService(IConfiguration configuration, IUserRepository userRepository, IUsersCodeRepository usersCodeRepository, IEmailService emailService, ILogger<UserService> logger)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _usersCodeRepository = usersCodeRepository ?? throw new ArgumentNullException(nameof(usersCodeRepository));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _expirySettings = configuration.GetSection("ExpirySettings").Get<ExpirySettings>() ?? throw new ArgumentNullException(nameof(ExpirySettings));
        }

        public async Task<User> AuthenticateAsync(string username, string password)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                {
                    _logger.LogWarning("Authentication failed: Username or password is empty");
                    return null;
                }
                var user = await _userRepository.GetByUsernameAsync(username);

                if (user != null && user.HashPassword != password) return null;

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during authentication");
                return null;
            }
        }

        public async Task<ServiceResult<IEnumerable<UserDto>>> GetUsersAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return ServiceResult<IEnumerable<UserDto>>.Failure("Page and limit must be greater than 0");
                }

                var users = await _userRepository.GetUsersAsync(page, limit);
                var userDtos = users.Select(MapToUserDto).ToList();

                return ServiceResult<IEnumerable<UserDto>>.Success(userDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paginated users");
                return ServiceResult<IEnumerable<UserDto>>.Failure("An error occurred while retrieving users");
            }
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                RoleName = user.Role?.Name,
                IsActive = user.IsActive
            };
        }

        #region App


        /// <summary>
        /// User login method for the application
        /// </summary>
        /// <param name="email">User's email</param>
        /// <param name="password">User's password</param> 
        public async Task<AppApiResponse<User>> LoginAsync(string email, string password)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                {
                    return AppApiResponse<User>.Failure("Email and password cannot be empty", HttpStatusCodeEnum.BadRequest);
                }

                var user = await _userRepository.GetByUsernameAsync(email);
                if (user == null || user.HashPassword != CommonUtilities.HashPassword(password))
                {
                    return AppApiResponse<User>.Failure("Invalid email or password", HttpStatusCodeEnum.Unauthorized);
                }

                return AppApiResponse<User>.Success(user, "Login successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return AppApiResponse<User>.Failure("User login failed");
            }
        }



        /// <summary>        
        /// User register method for the application
        /// </summary>
        /// <param name="user">User object containing signup details</param>
        /// <returns>AppApiResponse containing the created user or an error message</returns>
        /// <exception cref="ArgumentNullException">Thrown when user is null</exception>
        /// <exception cref="Exception">Thrown when an error occurs during signup</exception>
        public async Task<AppApiResponse<User>> RegisterAsync(User user)
        {

            try
            {
                var userExists = await _userRepository.GetByUsernameAsync(user.Email);
                if (userExists != null)
                {
                    return AppApiResponse<User>.Failure("User already exists", HttpStatusCodeEnum.Conflict);
                }

                var userDto = new User()
                {
                    Email = user.Email,
                    FullName = user.FullName,
                    PhoneNumber = user.PhoneNumber,
                    HashPassword = CommonUtilities.HashPassword(user.HashPassword),
                    RoleId = RoleType.Customer.AsInt(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _userRepository.AddAsync(userDto);

                var createdUser = await _userRepository.GetByUsernameAsync(user.Email);
                return AppApiResponse<User>.Success(createdUser, "User created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user register");
                return AppApiResponse<User>.Failure("User signup regiister failed");
            }
        }


        /// <summary>
        /// Initiates password reset process by generating and sending a reset code
        /// </summary>
        /// <param name="email">User's email address</param>
        /// <returns>AppApiResponse indicating success or failure</returns>
        public async Task<AppApiResponse<string>> SendPasswordVerificationCode(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                {
                    return AppApiResponse<string>.Failure("Email cannot be empty", HttpStatusCodeEnum.BadRequest);
                }

                var user = await _userRepository.GetByUsernameAsync(email);
                if (user == null)
                {
                    return AppApiResponse<string>.Failure("If the email exists, a reset code has been sent", HttpStatusCodeEnum.Conflict);
                }

                // Generate 6-digit reset code
                var resetCode = CommonUtilities.GenerateResetCode();


                // Create user code entry
                var userCode = new UsersCode
                {
                    UserId = user.UserId,
                    Code = resetCode,
                    StatusLookupId = UserCodeStatusLookup.Pending.AsInt(),
                    Note = "Password reset code",
                    IsActive = true,
                    ExpirationTime = DateTime.UtcNow.AddMinutes(_expirySettings.PasswordResetCodeExpiryMinutes)
                };

                // Save the code
                await _usersCodeRepository.AddAsync(userCode);

                // Send email with reset code
                var emailSent = await _emailService.SendPasswordResetCodeAsync(email, resetCode);

                _logger.LogInformation($"Password reset code generated for user {user.UserId}");

                return AppApiResponse<string>.Success(null, "Reset code sent successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset initiation");
                return AppApiResponse<string>.Failure("Failed to initiate password reset");
            }
        }

        /// <summary>
        /// Verifies if a reset code is valid
        /// </summary>
        /// <param name="email">User's email address</param>
        /// <param name="resetCode">6-digit reset code</param>
        /// <returns>AppApiResponse indicating if the code is valid</returns>
        public async Task<AppApiResponse<string>> VerifyResetCodeAsync(string email, string resetCode)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(resetCode))
                {
                    return AppApiResponse<string>.Failure("Email and reset code are required", HttpStatusCodeEnum.BadRequest);
                }

                var user = await _userRepository.GetByUsernameAsync(email);
                if (user == null)
                {
                    return AppApiResponse<string>.Failure("Invalid email or reset code", HttpStatusCodeEnum.BadRequest);
                }

                var validCode = await _usersCodeRepository.GetValidResetCodeAsync(user.UserId, resetCode, _expirySettings.PasswordResetCodeExpiryMinutes);
                if (validCode == null)
                {
                    return AppApiResponse<string>.Failure("Invalid or expired reset code", HttpStatusCodeEnum.BadRequest);
                }

                validCode.StatusLookupId = UserCodeStatusLookup.Processed.AsInt();
                validCode.Note = "Password reset completed";
                await _usersCodeRepository.UpdateAsync(validCode);

                return AppApiResponse<string>.Success(validCode.Code, "Reset code is valid");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during reset code verification");
                return AppApiResponse<string>.Failure("Failed to verify reset code");
            }
        }

        /// <summary>
        /// Verifies reset code and updates user's password
        /// </summary>
        /// <param name="email">User's email address</param>
        /// <param name="resetCode">6-digit reset code</param>
        /// <param name="newPassword">New password</param>
        /// <returns>AppApiResponse indicating success or failure</returns>
        public async Task<AppApiResponse<string>> ResetPasswordAsync(string email, string resetCode, string newPassword)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(newPassword))
                {
                    return AppApiResponse<string>.Failure("Email and new password are required", HttpStatusCodeEnum.BadRequest);
                }

                // Validate password strength (add your own validation rules)
                if (newPassword.Length < 6)
                {
                    return AppApiResponse<string>.Failure("Password must be at least 6 characters long", HttpStatusCodeEnum.BadRequest);
                }

                var user = await _userRepository.GetByUsernameAsync(email);
                if (user == null)
                {
                    return AppApiResponse<string>.Failure("Invalid Email Address", HttpStatusCodeEnum.BadRequest);
                }

                // Find valid reset code (within last 15 minutes)
                var validCode = await _usersCodeRepository.IsUserCodeValid(user.UserId, resetCode);
                if (!validCode)
                {
                    return AppApiResponse<string>.Failure("Invalid or expired reset code", HttpStatusCodeEnum.BadRequest);
                }

                // Update user's password
                user.HashPassword = CommonUtilities.HashPassword(newPassword);
                await _userRepository.UpdateAsync(user);


                _logger.LogInformation($"Password successfully reset for user {user.UserId}");

                return AppApiResponse<string>.Success(null, "Password reset successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset");
                return AppApiResponse<string>.Failure("Failed to reset password");
            }
        }
        #endregion
    }
}