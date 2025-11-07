using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model.Sections;
using NHD.Core.Services.Sections;

namespace NHD.Web.UI.Controllers.Portal
{
    [ApiController]
    [Route("api/[controller]")]
    public class SectionsController : ControllerBase
    {
        private readonly ILogger<SectionsController> _logger;
        private readonly ISectionService _sectionService;

        public SectionsController(ILogger<SectionsController> logger, ISectionService sectionService)
        {
            _logger = logger;
            _sectionService = sectionService;
        }

        [HttpGet]
        public async Task<ActionResult> GetSections([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _sectionService.GetSectionsAsync(page, limit);

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
        public async Task<ActionResult<ServiceResult<SectionViewModel>>> GetSectionById(int id)
        {
            var data = await _sectionService.GetViewModelSectionByIdAsync(id);
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpPost]
        [Route("Add")]
        public async Task<IActionResult> AddSection([FromForm] SectionViewModel dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Section data is required");

                if (dto.ImageFile == null || dto.ImageFile.Length == 0)
                    return BadRequest("Image is required");

                // Create unique file name
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageFile.FileName)}";
                var folderPath = Path.Combine("wwwroot/uploads", "sections");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var filePath = Path.Combine(folderPath, fileName);

                // Save the uploaded file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                // Create Section entity
                var section = new Section
                {
                    TitleEn = dto.TitleEn,
                    TitleSv = dto.TitleSv,
                    DescriptionEn = dto.DescriptionEn,
                    DescriptionSv = dto.DescriptionSv,
                    ImageUrl = fileName,
                    IsHomeSlider = dto.IsHomeSlider,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                // Use the transactional method instead of separate calls
                var created = await _sectionService.AddSectionAsync(section);

                return CreatedAtAction("GetSections", new { id = created.SectionId });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error adding section");

                // Clean up uploaded file if database operation failed
                try
                {
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageFile.FileName)}";
                    var folderPath = Path.Combine("wwwroot/uploads", "sections");
                    var filePath = Path.Combine(folderPath, fileName);
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                }
                catch (Exception cleanupEx)
                {
                    _logger.LogWarning(cleanupEx, "Failed to clean up uploaded file after database error");
                }

                return StatusCode(500, "An error occurred while adding the section.");
            }
        }

        [HttpPut]
        [Route("Update")]
        public async Task<IActionResult> UpdateSection([FromForm] SectionViewModel dto)
        {
            try
            {
                if (dto == null || dto.Id <= 0)
                {
                    return BadRequest("Valid product data is required.");
                }

                var existingSection = await _sectionService.GetSectionByIdAsync(dto.Id);
                if (existingSection == null)
                {
                    return NotFound("Section not found.");
                }

                string oldImagePath = existingSection.ImageUrl;

                // Handle new image upload if provided
                if (dto.ImageFile != null && dto.ImageFile.Length > 0)
                {
                    // Create unique file name
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageFile.FileName)}";
                    var folderPath = Path.Combine("wwwroot/uploads", "sections");

                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    var filePath = Path.Combine(folderPath, fileName);

                    // Save the uploaded file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.ImageFile.CopyToAsync(stream);
                    }

                    existingSection.ImageUrl = fileName;
                }

                // Update section properties
                existingSection.TitleEn = dto.TitleEn;
                existingSection.TitleSv = dto.TitleSv;
                existingSection.DescriptionEn = dto.DescriptionEn;
                existingSection.DescriptionSv = dto.DescriptionSv;
                existingSection.IsHomeSlider = dto.IsHomeSlider;
                existingSection.IsActive = dto.IsActive;
                existingSection.CreatedAt = DateTime.UtcNow;

                // Use the transactional method to update section and dates
                var updated = await _sectionService.UpdateSectionAsync(existingSection);

                // Delete old image file only after successful database update
                if (dto.ImageFile != null && dto.ImageFile.Length > 0 && !string.IsNullOrEmpty(oldImagePath))
                {
                    var oldFilePath = Path.Combine("wwwroot/uploads/sections", oldImagePath);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        try
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to delete old image file: {FilePath}", oldFilePath);
                            // Continue execution - this is not critical
                        }
                    }
                }

                return Ok(updated.SectionId);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error updating section");

                // Clean up newly uploaded file if database operation failed
                if (dto.ImageFile != null && dto.ImageFile.Length > 0)
                {
                    try
                    {
                        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageFile.FileName)}";
                        var folderPath = Path.Combine("wwwroot/uploads", "sections");
                        var filePath = Path.Combine(folderPath, fileName);
                        if (System.IO.File.Exists(filePath))
                            System.IO.File.Delete(filePath);
                    }
                    catch (Exception cleanupEx)
                    {
                        _logger.LogWarning(cleanupEx, "Failed to clean up uploaded file after database error");
                    }
                }

                return StatusCode(500, "An error occurred while updating the product.");
            }
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> DeleteSection(int id)
        {
            // First, try to get the section so we know the image name
            var section = await _sectionService.GetSectionByIdAsync(id);
            if (section == null)
            {
                return NotFound(new { message = "Section not found." });
            }

            // Attempt to delete from DB
            var result = await _sectionService.DeleteSectionAsync(id);

            if (!result.IsSuccess)
            {
                if (result.ErrorMessage?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
                    return NotFound(new { message = result.ErrorMessage });

                return BadRequest(new { message = result.ErrorMessage, validationErrors = result.ValidationErrors });
            }

            // ✅ Delete image file if it exists
            try
            {
                if (!string.IsNullOrEmpty(section.ImageUrl))
                {
                    var imagePath = Path.Combine("wwwroot/uploads/sections", section.ImageUrl);
                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                        _logger.LogInformation("Deleted image: {ImagePath}", imagePath);
                    }
                }
            }


            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete section image for section ID {Id}", id);
                // We won't fail the API here because the DB deletion already succeeded
            }

            return NoContent();
        }
    }
}