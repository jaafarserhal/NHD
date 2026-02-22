using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model.Properties;
using NHD.Core.Services.Parameters;

namespace NHD.Web.UI.Controllers.Portal
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertiesService _propertiesService;
        private readonly ILogger<PropertiesController> _logger;

        public PropertiesController(IPropertiesService propertiesService, ILogger<PropertiesController> logger)
        {
            _propertiesService = propertiesService;
            _logger = logger;
        }
        [HttpGet]
        public async Task<ActionResult> GetProperties([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _propertiesService.GetPropertiesAsync(page, limit);

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

        [HttpGet]
        [Route("GetById/{id}")]
        public async Task<ActionResult<ServiceResult<PropertiesViewModel>>> GetPropertyById(int id)
        {
            var data = await _propertiesService.GetPropertyByIdAsync(id);
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpPut]
        [Route("Update")]
        public async Task<ActionResult<ServiceResult<GenSystemParameter>>> UpdateProperty([FromBody] PropertiesViewModel property)
        {

            try
            {
                var parameter = new GenSystemParameter
                {
                    SystemParameterId = property.Id,
                    Title = property.Title,
                    ValueEn = property.ValueEn,
                    ValueSv = property.ValueSv,
                    IsActive = property.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                var updatedProperty = await _propertiesService.UpdatePropertyAsync(parameter);
                return Ok(ServiceResult<GenSystemParameter>.Success(updatedProperty));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating property with ID {property.Id}");
                return BadRequest(ServiceResult<GenSystemParameter>.Failure("An error occurred while updating the property"));
            }
        }
    }
}