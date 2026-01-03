using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Services.Dates;

namespace NHD.Web.UI.Controllers.Website
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatesController : ControllerBase
    {
        private readonly IDatesService _datesService;
        private readonly ILogger<DatesController> _logger;
        public DatesController(IDatesService datesService, ILogger<DatesController> logger)
        {
            _datesService = datesService ?? throw new ArgumentNullException(nameof(datesService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("AllDates")]
        public async Task<ActionResult> GetDates([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _datesService.GetAllDatesAsync(page, limit);

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

            return Ok(new
            {
                data = result.Data,
                total = result.Total,
                page = result.Page,
                limit = result.Limit,
                totalPages = result.TotalPages
            });
        }
    }
}