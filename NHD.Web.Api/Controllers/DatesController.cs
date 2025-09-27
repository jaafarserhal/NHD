using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Dates;
using NHD.Core.Services.Model.Dates;


namespace NHD.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatesController : ControllerBase
    {
        private readonly ILogger<DatesController> _logger;
        private readonly IDatesService _datesService;

        public DatesController(ILogger<DatesController> logger, IDatesService datesService)
        {
            _logger = logger;
            _datesService = datesService ?? throw new ArgumentNullException(nameof(datesService));
        }

        #region Dates
        [HttpGet]
        public async Task<ActionResult> GetDates([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _datesService.GetDatesAsync(page, limit);

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

        [HttpGet]
        [Route("GetById/{id}")]
        public async Task<ActionResult<ServiceResult<DateViewModel>>> GetDateById(int id)
        {
            var data = await _datesService.GetDatesByViewModel(id);
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }


        [HttpPost]
        [Route("Add")]
        public async Task<IActionResult> AddDate([FromBody] DateViewModel dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Date data is required");


                var date = new Date
                {
                    NameEn = dto.NameEn,
                    NameSv = dto.NameSv,
                    Quality = dto.Quality,
                    Price = dto.Price,
                    IsActive = dto.IsActive,
                };

                var created = await _datesService.AddDateAsync(date);
                return CreatedAtAction("GetDates", new { id = created.DateId });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error adding date");
                return StatusCode(500, "An error occurred while adding the date.");
            }
        }


        [HttpPut]
        [Route("Update")]
        public async Task<IActionResult> UpdateDate([FromBody] DateViewModel dto)
        {
            if (dto == null || dto.Id <= 0)
            {
                return BadRequest("Valid date data is required.");
            }

            var existingDate = await _datesService.GetDateAsync(dto.Id);
            if (existingDate == null)
            {
                return NotFound("Date not found.");
            }
            // Update fields
            existingDate.NameEn = dto.NameEn;
            existingDate.NameSv = dto.NameSv;
            existingDate.Quality = dto.Quality;
            existingDate.Price = dto.Price;
            existingDate.IsActive = dto.IsActive;
            existingDate.CreatedAt = DateTime.UtcNow;

            // Save changes
            var updatedDate = await _datesService.UpdateDateAsync(existingDate);

            return Ok(updatedDate.DateId);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> DeleteDate(int id)
        {
            var result = await _datesService.DeleteDateAsync(id);

            if (!result.IsSuccess)
            {
                if (result.ErrorMessage?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
                    return NotFound(new { message = result.ErrorMessage });

                return BadRequest(new { message = result.ErrorMessage, validationErrors = result.ValidationErrors });
            }

            return NoContent();
        }
        #endregion Products
    }
}