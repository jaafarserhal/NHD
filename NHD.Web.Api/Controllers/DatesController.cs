using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Dates;
using NHD.Core.Services.Model;
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
                    CollectionId = dto.CollectionId,
                    Quality = dto.Quality,
                    UnitPrice = dto.UnitPrice,
                    WeightPrice = dto.WeightPrice,
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
            existingDate.CollectionId = dto.CollectionId;
            existingDate.Quality = dto.Quality;
            existingDate.UnitPrice = dto.UnitPrice;
            existingDate.WeightPrice = dto.WeightPrice;
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
        #endregion Dates

        #region Collections
        [HttpGet("Collections")]
        public async Task<ActionResult> GetCollections([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _datesService.GetDatesCollectionAsync(page, limit);

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

        [HttpGet("Collections/{id}")]
        public async Task<ActionResult<ServiceResult<DatesCollectionViewModel>>> GetCollectionById(int id)
        {
            var data = await _datesService.GetCollectionByViewModel(id);
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpDelete("Collections/Delete/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            // First, try to get the product so we know the image name
            var collection = await _datesService.GetCollectionAsync(id);
            if (collection == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            // Attempt to delete from DB
            var result = await _datesService.DeleteCollectionAsync(id);

            if (!result.IsSuccess)
            {
                if (result.ErrorMessage?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
                    return NotFound(new { message = result.ErrorMessage });

                return BadRequest(new { message = result.ErrorMessage, validationErrors = result.ValidationErrors });
            }

            // ✅ Delete image file if it exists
            try
            {
                if (!string.IsNullOrEmpty(collection.ImageUrl))
                {
                    var imagePath = Path.Combine("wwwroot/uploads/collections", collection.ImageUrl);
                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                        _logger.LogInformation("Deleted image: {ImagePath}", imagePath);
                    }
                }
            }


            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete product image for product ID {Id}", id);
                // We won't fail the API here because the DB deletion already succeeded
            }

            return NoContent();
        }

        [HttpGet]
        [Route("Collections/Active")]
        public async Task<ActionResult<ServiceResult<IEnumerable<LookupItemDto>>>> GetActiveCollections()
        {
            var data = await _datesService.GetCollectionsAsync();
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpPost("Collections/Add")]
        public async Task<IActionResult> AddCollection([FromForm] DatesCollectionViewModel dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Collection data is required");


                if (dto.ImageFile == null || dto.ImageFile.Length == 0)
                    return BadRequest("Image is required");
                // Create unique file name
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageFile.FileName)}";
                var folderPath = Path.Combine("wwwroot/uploads", "collections");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var filePath = Path.Combine(folderPath, fileName);

                // Save the uploaded file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                // Create Product entity
                var collection = new DatesCollection
                {
                    NameEn = dto.NameEn,
                    NameSv = dto.NameSv,
                    ImageUrl = fileName,
                    DescriptionEn = dto.DescriptionEn,
                    DescriptionSv = dto.DescriptionSv,
                    IsActive = dto.IsActive,
                };

                var created = await _datesService.AddCollectionAsync(collection);

                return CreatedAtAction("GetCollections", new { id = created.CollectionId });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error adding collection");
                return StatusCode(500, "An error occurred while adding the collection.");
            }
        }

        [HttpPut]
        [Route("Collections/Update")]
        public async Task<IActionResult> UpdateCollection([FromForm] DatesCollectionViewModel dto)
        {
            try
            {
                if (dto == null || dto.Id <= 0)
                {
                    return BadRequest("Valid collection data is required.");
                }

                var existingCollection = await _datesService.GetCollectionAsync(dto.Id);
                if (existingCollection == null)
                {
                    return NotFound("Collection not found.");
                }

                string oldImagePath = existingCollection.ImageUrl;

                // Handle new image upload if provided
                if (dto.ImageFile != null && dto.ImageFile.Length > 0)
                {
                    // Create unique file name
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageFile.FileName)}";
                    var folderPath = Path.Combine("wwwroot/uploads", "collections");

                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    var filePath = Path.Combine(folderPath, fileName);

                    // Save the uploaded file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.ImageFile.CopyToAsync(stream);
                    }

                    existingCollection.ImageUrl = fileName;
                }

                // Update collection properties
                existingCollection.NameEn = dto.NameEn;
                existingCollection.NameSv = dto.NameSv;
                existingCollection.DescriptionEn = dto.DescriptionEn;
                existingCollection.DescriptionSv = dto.DescriptionSv;
                existingCollection.IsActive = dto.IsActive;
                existingCollection.CreatedAt = DateTime.UtcNow;

                var updated = await _datesService.UpdateCollectionAsync(existingCollection);
                return Ok(updated);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error updating collection");
                return StatusCode(500, "An error occurred while updating the collection.");
            }
        }
        #endregion Collections
    }
}