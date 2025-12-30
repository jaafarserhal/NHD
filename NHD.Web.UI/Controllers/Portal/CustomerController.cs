using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Services.Customers;
using NHD.Core.Services.Model.Customer;

namespace NHD.Web.UI.Controllers.Portal
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ILogger<CustomerController> _logger;
        public CustomerController(ICustomerService customerService, ILogger<CustomerController> logger)
        {
            _customerService = customerService ?? throw new ArgumentNullException(nameof(customerService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<ActionResult> GetCustomers([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _customerService.GetCustomersAsync(page, limit);

            if (!result.IsSuccess)
            {
                if (result.ValidationErrors?.Any() == true)
                {
                    return BadRequest(new
                    {
                        message = result.ErrorMessage,
                        errors = result.ValidationErrors
                    });
                }
                return BadRequest(new { message = result.ErrorMessage });
            }

            // Return the structure that your frontend expects
            return Ok(new
            {
                data = result.Data,
                total = result.Total,
                page = result.Page,
                limit = result.Limit,
                totalPages = result.TotalPages
            });
        }

        [HttpGet("Addresses")]
        public async Task<ActionResult> GetAddressesByCustomerId([FromQuery] int customerId, [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _customerService.GetAddressesByCustomerId(customerId, page, limit);

            if (!result.IsSuccess)
            {
                if (result.ValidationErrors?.Any() == true)
                {
                    return BadRequest(new
                    {
                        message = result.ErrorMessage,
                        errors = result.ValidationErrors
                    });
                }
                return BadRequest(new { message = result.ErrorMessage });
            }

            // Return the structure that your frontend expects
            return Ok(new
            {
                data = result.Data,
                total = result.Total,
                page = result.Page,
                limit = result.Limit,
                totalPages = result.TotalPages
            });
        }

        [HttpPut("UpdateStatus")]
        public async Task<ActionResult> UpdateCustomerStatus([FromBody] CustomerStatusBindingModel model)
        {
            try
            {
                if (model == null)
                {
                    return BadRequest(new { message = "Invalid request data." });
                }

                var result = await _customerService.UpdateCustomerStatusAsync(model.CustomerId, model.StatusId);
                if (!result.IsSuccess)
                {
                    return BadRequest(new { message = result.ErrorMessage });
                }

                return Ok(new { message = "Customer status updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer status for customerId {CustomerId}", model.CustomerId);
                return StatusCode(500, new { message = "An error occurred while updating the customer status." });
            }
        }
    }
}