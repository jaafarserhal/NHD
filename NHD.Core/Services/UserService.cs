
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
        private readonly IEmailService _emailService;
        private readonly ILogger<UserService> _logger;

        private readonly ExpirySettings _expirySettings;



        public UserService(IConfiguration configuration, IUserRepository userRepository, IEmailService emailService, ILogger<UserService> logger)
        {
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));

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

                if (user != null && user.Password != password) return null;

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
                Email = user.EmailAddress,
                FullName = user.FullName,
                IsActive = user.IsActive ?? false,
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
                if (user == null || user.Password != CommonUtilities.HashPassword(password))
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
                var userExists = await _userRepository.GetByUsernameAsync(user.EmailAddress);
                if (userExists != null)
                {
                    return AppApiResponse<User>.Failure("User already exists", HttpStatusCodeEnum.Conflict);
                }

                var userDto = new User()
                {
                    EmailAddress = user.EmailAddress,
                    FullName = user.FullName,
                    Password = CommonUtilities.HashPassword(user.Password),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _userRepository.AddAsync(userDto);

                var createdUser = await _userRepository.GetByUsernameAsync(user.EmailAddress);
                return AppApiResponse<User>.Success(createdUser, "User created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user register");
                return AppApiResponse<User>.Failure("User signup regiister failed");
            }
        }
        #endregion
    }
}