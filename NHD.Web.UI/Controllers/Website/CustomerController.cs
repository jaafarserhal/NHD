using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Customers;
using NHD.Core.Services.Model.Customer;
using NHD.Core.Utilities;

namespace NHD.Web.UI.Controllers.Website
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly ILogger<CustomerController> _logger;
        private readonly ICustomerService _customerService;
        private readonly string _jwtSecret;

        public CustomerController(ILogger<CustomerController> logger, ICustomerService customerService, IConfiguration configuration)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _customerService = customerService ?? throw new ArgumentNullException(nameof(customerService));
            _jwtSecret = configuration["JwtSettings:SecretKey"] ?? throw new ArgumentNullException("JwtSettings:SecretKey");
        }

        #region Customer Actions

        [HttpPost("Register")]
        public async Task<IActionResult> RegisterCustomer([FromBody] CustomerRegistrationModel dto)
        {
            try
            {
                if (dto == null || string.IsNullOrEmpty(dto.EmailAddress) || string.IsNullOrEmpty(dto.Password))
                    return BadRequest("Customer data is required");

                var customer = new Customer
                {
                    EmailAddress = dto.EmailAddress,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Mobile = dto.Mobile,
                    Password = CommonUtilities.HashPassword(dto.Password),
                    IsActive = false,  // not active until email verified
                    StatusLookupId = CustomerStatusLookup.Pending.AsInt(),
                    CreatedAt = DateTime.UtcNow,
                };

                var result = await _customerService.RegisterAsync(customer);

                if (!result.IsSuccess && result.Status == HttpStatusCodeEnum.Conflict.AsInt())
                    return Conflict(result.ErrorMessage);

                if (!result.IsSuccess)
                    return BadRequest(result.ErrorMessage);

                return Ok(new { Message = result.Data });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error adding customer");
                return StatusCode(500, "An error occurred while adding the customer.");
            }
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] CustomerLoginModel login)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var authResult = await _customerService.LoginAsync(login.Email, login.Password);

            if (authResult == null || authResult.StatusCode == HttpStatusCodeEnum.Unauthorized.AsInt())
            {
                _logger.LogWarning("Invalid login attempt for email: {Email}", login.Email);
                return Unauthorized(new { message = "Wrong email or password." });
            }

            // Generate JWT token
            var token = GenerateJwtToken(authResult.Data.EmailAddress);

            var userResponse = new UserLoginResponse
            {
                Email = authResult.Data.EmailAddress,
                FullName = $"{authResult.Data.FirstName} {authResult.Data.LastName}"
            };

            _logger.LogInformation("User {Email} logged in successfully", login.Email);

            return Ok(new
            {
                token,
                user = userResponse
            });
        }

        [HttpPost("VerifyEmail")]
        public async Task<IActionResult> VerifyEmail([FromBody] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Token is required.");

            var customer = await _customerService.GetCustomerByVerificationTokenAsync(token);

            if (customer == null)
                return Conflict("Invalid verification token.");

            if (customer.EmailVerificationTokenExpires <= DateTime.UtcNow)
                return Conflict("Verification token has expired.");

            // Activate customer
            customer.IsActive = true;
            customer.StatusLookupId = CustomerStatusLookup.Active.AsInt();
            customer.EmailVerificationToken = null;
            customer.EmailVerificationTokenExpires = null;

            await _customerService.UpdateCustomerAsync(customer);

            return Ok("Email verified successfully.");
        }

        [HttpPost("InitiatePasswordReset")]
        public async Task<IActionResult> InitiatePasswordReset([FromBody] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email is required.");
            var result = await _customerService.InitiatePasswordResetAsync(email);
            if (!result.IsSuccess)
            {
                return BadRequest(new { message = result.ErrorMessage });
            }
            return Ok(new { message = "If there is an account associated with " + email + " you will receive an email with a link to reset your password." });
        }

        [HttpPut("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Token) || string.IsNullOrEmpty(model.Password))
                    return BadRequest("All fields are required.");

                var customer = await _customerService.GetCustomerByVerificationTokenAsync(model.Token);

                if (customer == null)
                    return Conflict("Invalid password reset token, please request a new one.");
                // Check if token is expired
                if (customer.EmailVerificationTokenExpires <= DateTime.UtcNow)
                    return Conflict("Password reset token has expired.");

                customer.Password = model.Password;
                customer.EmailVerificationToken = null;
                customer.EmailVerificationTokenExpires = null;

                var result = await _customerService.ChangePasswordAsync(customer);
                if (!result.IsSuccess)
                {
                    return BadRequest(new { message = result.ErrorMessage });
                }
                return Ok(new { message = "Password has been reset successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password");
                return StatusCode(HttpStatusCodeEnum.InternalServerError.AsInt(), new { message = "An error occurred while resetting the password." });
            }
        }

        [HttpPut("ChangePassword")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] CustomerBindingModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Password))
                    return BadRequest("Password is required.");

                // Extract email from JWT token claims
                var email = User.FindFirst(ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(email))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var customer = await _customerService.GetCustomerInfoByEmailAsync(email);

                if (customer == null)
                {
                    return NotFound(new { message = "Customer not found" });
                }

                customer.Password = model.Password;
                var result = await _customerService.ChangePasswordAsync(customer);

                return Ok(new { message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(HttpStatusCodeEnum.InternalServerError.AsInt(), new { message = "An error occurred" });
            }
        }

        [HttpPut("UpdateCustomerInfo")]
        [Authorize]
        public async Task<IActionResult> UpdateCustomerInfo([FromBody] CustomerBindingModel model)
        {
            try
            {
                if (model == null)
                    return BadRequest("Model is required.");

                // Extract email from JWT token claims
                var email = User.FindFirst(ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(email))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var customer = await _customerService.GetCustomerInfoByEmailAsync(email);

                if (customer == null)
                {
                    return NotFound(new { message = "Customer not found" });
                }

                customer.FirstName = model.FirstName;
                customer.LastName = model.LastName;
                customer.Mobile = model.Mobile;
                await _customerService.UpdateCustomerAsync(customer);

                return Ok(new { message = "Information updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating information");
                return StatusCode(HttpStatusCodeEnum.InternalServerError.AsInt(), new { message = "An error occurred" });
            }
        }

        [HttpGet("Info")]
        [Authorize]
        public async Task<ActionResult<ServiceResult<CustomerInfoModel>>> GetCustomerInfo()
        {
            try
            {
                // Extract email from JWT token claims
                var email = User.FindFirst(ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(email))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                // Fetch user details from database
                var customer = await _customerService.GetCustomerByEmailAsync(email);

                if (customer == null || customer.StatusCode != HttpStatusCodeEnum.OK.AsInt())
                {
                    return NotFound(new { message = "User not found" });
                }

                var customerResponse = new CustomerInfoModel
                {
                    Email = customer.Data.EmailAddress,
                    FirstName = customer.Data.FirstName,
                    LastName = customer.Data.LastName,
                    Mobile = customer.Data.Mobile,
                    Addresses = customer.Data.Addresses?.Select(a => new CustomerAddressModel
                    {
                        Id = a.AddressId,
                        FirstName = a.ContactFirstName,
                        LastName = a.ContactLastName,
                        Phone = a.ContactPhone,
                        StreetName = a.StreetName,
                        StreetNumber = a.StreetNumber,
                        PostalCode = a.PostalCode,
                        City = a.City,
                        Type = a.AddressTypeLookup.NameEn,
                        TypeId = a.AddressTypeLookupId,
                        IsPrimary = a.IsPrimary
                    }).ToList() ?? new List<CustomerAddressModel>()
                };

                return Ok(new ServiceResult<CustomerInfoModel>
                {
                    Data = customerResponse,
                    IsSuccess = true,
                    Status = HttpStatusCodeEnum.OK.AsInt()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                return StatusCode(HttpStatusCodeEnum.InternalServerError.AsInt(), new { message = "An error occurred" });
            }
        }
        private string GenerateJwtToken(string email)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);

            var claims = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, email),
                new Claim(ClaimTypes.Email, email),
                // Add more claims as needed
            });

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = claims,
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        #endregion Customer Actions

        #region Address Actions

        [HttpPost("AddAddress")]
        [Authorize]
        public async Task<IActionResult> AddAddress([FromBody] CustomerAddressModel model)
        {
            try
            {
                if (model == null)
                    return BadRequest("Address model is required.");

                var address = new Address
                {
                    ContactFirstName = model.FirstName,
                    ContactLastName = model.LastName,
                    ContactPhone = model.Phone,
                    StreetName = model.StreetName,
                    StreetNumber = model.StreetNumber,
                    PostalCode = model.PostalCode,
                    City = model.City,
                    AddressTypeLookupId = model.TypeId,
                    IsPrimary = model.IsPrimary,
                };

                var addedAddress = await _customerService.AddAddressAsync(address);
                return Ok(addedAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding address");
                return StatusCode(HttpStatusCodeEnum.InternalServerError.AsInt(), "An error occurred while adding the address.");
            }
        }

        [HttpPut("UpdateAddress")]
        [Authorize]
        public async Task<IActionResult> UpdateAddress([FromBody] CustomerAddressModel model)
        {
            try
            {
                if (model == null || model.Id <= 0)
                    return BadRequest("Address model is required.");

                var address = new Address
                {
                    AddressId = model.Id,
                    ContactFirstName = model.FirstName,
                    ContactLastName = model.LastName,
                    ContactPhone = model.Phone,
                    StreetName = model.StreetName,
                    StreetNumber = model.StreetNumber,
                    PostalCode = model.PostalCode,
                    City = model.City,
                    AddressTypeLookupId = model.TypeId,
                    IsPrimary = model.IsPrimary,
                };
                var updatedAddress = await _customerService.UpdateAddressAsync(address);
                return Ok(updatedAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating address");
                return StatusCode(HttpStatusCodeEnum.InternalServerError.AsInt(), "An error occurred while updating the address.");
            }
        }

        [HttpGet("Address/{addressId}")]
        [Authorize]
        public async Task<ActionResult<ServiceResult<CustomerAddressModel>>> GetAddress(int addressId)
        {
            try
            {
                var address = await _customerService.GetAddressAsync(addressId);
                if (address == null)
                {
                    return NotFound("Address not found.");
                }

                var customerAddress = new CustomerAddressModel
                {
                    Id = address.AddressId,
                    FirstName = address.ContactFirstName,
                    LastName = address.ContactLastName,
                    Phone = address.ContactPhone,
                    StreetName = address.StreetName,
                    StreetNumber = address.StreetNumber,
                    PostalCode = address.PostalCode,
                    City = address.City,
                    TypeId = address.AddressTypeLookupId,
                    IsPrimary = address.IsPrimary
                };
                return Ok(new ServiceResult<CustomerAddressModel>
                {
                    Data = customerAddress,
                    IsSuccess = true,
                    Status = HttpStatusCodeEnum.OK.AsInt()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving address");
                return StatusCode(HttpStatusCodeEnum.InternalServerError.AsInt(), "An error occurred while retrieving the address.");
            }
        }

        #endregion Address Actions
    }
}