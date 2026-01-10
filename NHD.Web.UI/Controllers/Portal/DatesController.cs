using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Dates;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Collections;
using NHD.Core.Services.Model.Dates;


namespace NHD.Web.UI.Portal.Controllers
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
        public async Task<IActionResult> AddDate([FromForm] DateViewModel dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Date data is required");

                if (dto.ImageFile == null || dto.ImageFile.Length == 0)
                    return BadRequest("Image is required");

                // Create unique file name
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageFile.FileName)}";
                var folderPath = Path.Combine("wwwroot/uploads", "dates");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var filePath = Path.Combine(folderPath, fileName);

                // Save the uploaded file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                var bannerFileName = "";
                if (dto.BannerImageFile != null && dto.BannerImageFile.Length > 0)
                {
                    // Create unique file name for banner
                    bannerFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.BannerImageFile.FileName)}";
                    var bannerFolderPath = Path.Combine("wwwroot/uploads", "dates");

                    if (!Directory.Exists(bannerFolderPath))
                        Directory.CreateDirectory(bannerFolderPath);

                    var bannerFilePath = Path.Combine(bannerFolderPath, bannerFileName);

                    // Save the uploaded banner file
                    using (var bannerStream = new FileStream(bannerFilePath, FileMode.Create))
                    {
                        await dto.BannerImageFile.CopyToAsync(bannerStream);
                    }
                }

                var date = new Date
                {
                    NameEn = dto.NameEn,
                    NameSv = dto.NameSv,
                    Quality = dto.Quality,
                    UnitPrice = dto.UnitPrice,
                    WeightPrice = dto.WeightPrice,
                    DescriptionEn = dto.DescriptionEn,
                    DescriptionSv = dto.DescriptionSv,
                    ImageUrl = fileName,
                    BannerImageUrl = bannerFileName,
                    IsFilled = dto.IsFilled,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _datesService.SaveDatesWithAdditionalInfo(date, dto.AdditionalInfos);
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
        public async Task<IActionResult> UpdateDate([FromForm] DateViewModel dto)
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

            string oldImageFileName = existingDate.ImageUrl;
            string? newFileName = null;

            // Handle new image upload if provided
            if (dto.ImageFile != null && dto.ImageFile.Length > 0)
            {
                // Create unique file name
                newFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageFile.FileName)}";
                var folderPath = Path.Combine("wwwroot/uploads", "dates");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var filePath = Path.Combine(folderPath, newFileName);

                // Save the uploaded file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                existingDate.ImageUrl = newFileName;
            }

            string oldBannerFileName = existingDate.BannerImageUrl;
            string? newBannerFileName = null;

            // Handle new banner image upload if provided
            if (dto.BannerImageFile != null && dto.BannerImageFile.Length > 0)
            {
                // Create unique file name for banner
                newBannerFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.BannerImageFile.FileName)}";
                var bannerFolderPath = Path.Combine("wwwroot/uploads", "dates");

                if (!Directory.Exists(bannerFolderPath))
                    Directory.CreateDirectory(bannerFolderPath);

                var bannerFilePath = Path.Combine(bannerFolderPath, newBannerFileName);

                // Save the uploaded banner file
                using (var bannerStream = new FileStream(bannerFilePath, FileMode.Create))
                {
                    await dto.BannerImageFile.CopyToAsync(bannerStream);
                }
                existingDate.BannerImageUrl = newBannerFileName;
            }

            // Update fields
            existingDate.NameEn = dto.NameEn;
            existingDate.NameSv = dto.NameSv;
            existingDate.Quality = dto.Quality;
            existingDate.UnitPrice = dto.UnitPrice;
            existingDate.WeightPrice = dto.WeightPrice;
            existingDate.DescriptionEn = dto.DescriptionEn;
            existingDate.DescriptionSv = dto.DescriptionSv;
            existingDate.IsFilled = dto.IsFilled;
            existingDate.IsActive = dto.IsActive;
            existingDate.CreatedAt = DateTime.UtcNow;

            // Save changes
            var updatedDate = await _datesService.SaveDatesWithAdditionalInfo(existingDate, dto.AdditionalInfos);


            // If update succeeded and a new image was uploaded, delete the old one
            if (newFileName != null && !string.IsNullOrEmpty(oldImageFileName))
            {
                var oldFilePath = Path.Combine("wwwroot/uploads/dates", oldImageFileName);
                if (System.IO.File.Exists(oldFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete old image file: {FilePath}", oldFilePath);
                    }
                }
            }

            // If update succeeded and a new banner image was uploaded, delete the old one
            if (newBannerFileName != null && !string.IsNullOrEmpty(oldBannerFileName))
            {
                var oldBannerFilePath = Path.Combine("wwwroot/uploads/dates", oldBannerFileName);
                if (System.IO.File.Exists(oldBannerFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldBannerFilePath);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete old banner image file: {FilePath}", oldBannerFilePath);
                    }
                }
            }

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
        public async Task<ActionResult<ServiceResult<CollectionViewModel>>> GetCollectionById(int id)
        {
            var data = await _datesService.GetCollectionByViewModel(id);
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpDelete("Collections/Delete/{id}")]
        public async Task<IActionResult> DeleteCollection(int id)
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

        [HttpPost("Collections/Add")]
        public async Task<IActionResult> AddCollection([FromForm] CollectionViewModel dto)
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
                var collection = new Collection
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
        public async Task<IActionResult> UpdateCollection([FromForm] CollectionViewModel dto)
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

                string oldImageFileName = existingCollection.ImageUrl;
                string? newFileName = null;
                // Handle new image upload if provided
                if (dto.ImageFile != null && dto.ImageFile.Length > 0)
                {
                    // Create unique file name
                    newFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageFile.FileName)}";
                    var folderPath = Path.Combine("wwwroot/uploads", "collections");

                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    var filePath = Path.Combine(folderPath, newFileName);

                    // Save the uploaded file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.ImageFile.CopyToAsync(stream);
                    }

                    existingCollection.ImageUrl = newFileName;
                }

                // Update collection properties
                existingCollection.NameEn = dto.NameEn;
                existingCollection.NameSv = dto.NameSv;
                existingCollection.DescriptionEn = dto.DescriptionEn;
                existingCollection.DescriptionSv = dto.DescriptionSv;
                existingCollection.IsActive = dto.IsActive;
                existingCollection.CreatedAt = DateTime.UtcNow;

                var updated = await _datesService.UpdateCollectionAsync(existingCollection);

                // If update succeeded and a new image was uploaded, delete the old one
                if (newFileName != null && !string.IsNullOrEmpty(oldImageFileName))
                {
                    var oldFilePath = Path.Combine("wwwroot/uploads/collections", oldImageFileName);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        try
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to delete old image file: {FilePath}", oldFilePath);
                        }
                    }
                }
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