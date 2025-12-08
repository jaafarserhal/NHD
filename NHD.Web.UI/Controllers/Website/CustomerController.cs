using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Models;
using NHD.Core.Services.Customers;
using NHD.Core.Services.Model.Customer;

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
                if (dto == null)
                    return BadRequest("Customer data is required");

                var customer = new Customer
                {
                    EmailAddress = dto.Email,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Mobile = dto.PhoneNumber,
                    //Provider = dto.Provider,
                    //ProviderId = dto.ProviderId
                };

                var created = await _customerService.AddCustomerAsync(customer);
                return CreatedAtAction("GetCustomer", new { id = created.Data.CustomerId }, created.Data);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error adding customer");
                return StatusCode(500, "An error occurred while adding the customer.");
            }
        }
    }
}