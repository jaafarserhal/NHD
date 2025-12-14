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
        public async Task<IActionResult> GetCurrentCustomer()
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
                    Mobile = customer.Data.Mobile
                };

                return Ok(customerResponse);
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
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}