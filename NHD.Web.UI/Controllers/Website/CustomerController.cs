using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
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

        public CustomerController(ILogger<CustomerController> logger, ICustomerService customerService)
        {
            _logger = logger;
            _customerService = customerService;
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

                var result = await _customerService.RegisterCustomerAsync(customer);

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


    }
}