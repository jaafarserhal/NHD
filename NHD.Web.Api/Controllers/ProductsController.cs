using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Dates;
using NHD.Core.Services.Model.Products;
using NHD.Core.Services.Products;

namespace NHD.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ILogger<ProductsController> _logger;
        private readonly IProductService _productService;

        public ProductsController(ILogger<ProductsController> logger, IProductService productService)
        {
            _logger = logger;
            _productService = productService ?? throw new ArgumentNullException(nameof(productService));
        }

        #region Products
        [HttpGet]
        public async Task<ActionResult> GetProducts([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _productService.GetProductsAsync(page, limit);

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
        public async Task<ActionResult<ServiceResult<ProductViewModel>>> GetProductById(int id)
        {
            var data = await _productService.GetProductWithDetailsByIdAsync(id);
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpPost]
        [Route("Add")]
        public async Task<IActionResult> AddProduct([FromForm] ProductBindingModel dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Product data is required");

                if (dto.ImageUrl == null || dto.ImageUrl.Length == 0)
                    return BadRequest("Image is required");

                // Create unique file name
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageUrl.FileName)}";
                var folderPath = Path.Combine("wwwroot/uploads", "products");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var filePath = Path.Combine(folderPath, fileName);

                // Save the uploaded file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageUrl.CopyToAsync(stream);
                }

                // Create Product entity
                var product = new Product
                {
                    PrdLookupCategoryId = dto.CategoryId,
                    PrdLookupTypeId = dto.TypeId,
                    PrdLookupSizeId = dto.SizeId,
                    NameEn = dto.NameEn,
                    NameSv = dto.NameSv,
                    DescriptionEn = dto.DescriptionEn,
                    DescriptionSv = dto.DescriptionSv,
                    FromPrice = dto.FromPrice,
                    IsCarousel = dto.IsCarousel,
                    IsActive = dto.IsActive,
                    ImageUrl = fileName
                };

                // Use the transactional method instead of separate calls
                var created = await _productService.SaveProductWithDatesAsync(product, dto.Dates);

                return CreatedAtAction("GetProducts", new { id = created.PrdId });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error adding product");

                // Clean up uploaded file if database operation failed
                try
                {
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageUrl.FileName)}";
                    var folderPath = Path.Combine("wwwroot/uploads", "products");
                    var filePath = Path.Combine(folderPath, fileName);
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                }
                catch (Exception cleanupEx)
                {
                    _logger.LogWarning(cleanupEx, "Failed to clean up uploaded file after database error");
                }

                return StatusCode(500, "An error occurred while adding the product.");
            }
        }


        [HttpPut]
        [Route("Update")]
        public async Task<IActionResult> UpdateProduct([FromForm] ProductBindingModel dto)
        {
            try
            {
                if (dto == null || dto.Id <= 0)
                {
                    return BadRequest("Valid product data is required.");
                }

                var existingProduct = await _productService.GetProductAsync(dto.Id);
                if (existingProduct == null)
                {
                    return NotFound("Product not found.");
                }

                string oldImagePath = existingProduct.ImageUrl;

                // Handle new image upload if provided
                if (dto.ImageUrl != null && dto.ImageUrl.Length > 0)
                {
                    // Create unique file name
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageUrl.FileName)}";
                    var folderPath = Path.Combine("wwwroot/uploads", "products");

                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    var filePath = Path.Combine(folderPath, fileName);

                    // Save the uploaded file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.ImageUrl.CopyToAsync(stream);
                    }

                    existingProduct.ImageUrl = fileName;
                }

                // Update product properties
                existingProduct.PrdLookupCategoryId = dto.CategoryId;
                existingProduct.PrdLookupTypeId = dto.TypeId;
                existingProduct.PrdLookupSizeId = dto.SizeId;
                existingProduct.NameEn = dto.NameEn;
                existingProduct.NameSv = dto.NameSv;
                existingProduct.DescriptionEn = dto.DescriptionEn;
                existingProduct.DescriptionSv = dto.DescriptionSv;
                existingProduct.FromPrice = dto.FromPrice;
                existingProduct.IsCarousel = dto.IsCarousel;
                existingProduct.IsActive = dto.IsActive;
                existingProduct.CreatedAt = DateTime.UtcNow;

                // Use the transactional method to update product and dates
                var updated = await _productService.SaveProductWithDatesAsync(existingProduct, dto.Dates);

                // Delete old image file only after successful database update
                if (dto.ImageUrl != null && dto.ImageUrl.Length > 0 && !string.IsNullOrEmpty(oldImagePath))
                {
                    var oldFilePath = Path.Combine("wwwroot/uploads/products", oldImagePath);
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

                return Ok(updated.PrdId);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error updating product");

                // Clean up newly uploaded file if database operation failed
                if (dto.ImageUrl != null && dto.ImageUrl.Length > 0)
                {
                    try
                    {
                        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageUrl.FileName)}";
                        var folderPath = Path.Combine("wwwroot/uploads", "products");
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
        public async Task<IActionResult> DeleteProduct(int id)
        {
            // First, try to get the product so we know the image name
            var product = await _productService.GetProductAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            // Attempt to delete from DB
            var result = await _productService.DeleteProductAsync(id);

            if (!result.IsSuccess)
            {
                if (result.ErrorMessage?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
                    return NotFound(new { message = result.ErrorMessage });

                return BadRequest(new { message = result.ErrorMessage, validationErrors = result.ValidationErrors });
            }

            // ✅ Delete image file if it exists
            try
            {
                if (!string.IsNullOrEmpty(product.ImageUrl))
                {
                    var imagePath = Path.Combine("wwwroot/uploads/products", product.ImageUrl);
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
        [Route("AllDates")]
        public async Task<ActionResult<ServiceResult<IEnumerable<DateViewModel>>>> GetAllDates()
        {
            var data = await _productService.GetAllDatesAsync();
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpGet("AllGalleries/{id:int}/{type}")]
        public async Task<ActionResult<ServiceResult<IEnumerable<ProductGalleryViewModel>>>> GetAllGalleries(int id, string type)
        {
            if (string.IsNullOrWhiteSpace(type))
                return BadRequest(new { message = "Type parameter is required." });

            int? productId = null;
            int? dateId = null;

            switch (type.ToLowerInvariant())
            {
                case "product":
                    productId = id;
                    break;
                case "date":
                    dateId = id;
                    break;
                default:
                    return BadRequest(new { message = "Invalid type parameter. Must be 'product' or 'date'." });
            }

            var result = await _productService.GetGalleriesAsync(productId, dateId);

            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }


        [HttpPost]
        [Route("AddGallery")]
        public async Task<IActionResult> AddGallery([FromForm] ProductGalleryBindingModel dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Product data is required");

                if (dto.ImageUrl == null || dto.ImageUrl.Length == 0)
                    return BadRequest("Image is required");

                // Validate file size (1MB max as per frontend)
                if (dto.ImageUrl.Length > 1024 * 1024)
                    return BadRequest("Image size must be less than 1MB");

                // Create unique file name
                string folderName = dto.PrdId != 0 ? "products" : "dates";
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageUrl.FileName)}";
                var folderPath = Path.Combine("wwwroot/uploads", folderName);

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageUrl.CopyToAsync(stream);
                }

                // Create Product entity
                var gallery = new Gallery
                {
                    PrdId = dto.PrdId == 0 ? (int?)null : dto.PrdId,
                    DateId = dto.DateId == 0 ? (int?)null : dto.DateId,
                    ImageUrl = fileName,
                    SortOrder = dto.SortOrder,
                    AltText = dto.AltText,
                    MimeType = dto.ImageUrl.ContentType,
                    FileSizeKb = (int)(dto.ImageUrl.Length / 1024),
                    IsPrimary = false
                };

                var created = await _productService.AddGalleryAsync(gallery);
                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding product gallery");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }


        [HttpDelete("DeleteGallery/{galleryId}")]
        public async Task<IActionResult> DeleteGallery(int galleryId)
        {
            // First, try to get the product so we know the image name
            var gallery = await _productService.GetGalleryAsync(galleryId);
            if (gallery == null)
            {
                return NotFound(new { message = "Gallery not found." });
            }

            // Attempt to delete from DB
            var result = await _productService.DeleteGalleryAsync(galleryId);

            if (!result.IsSuccess)
            {
                if (result.ErrorMessage?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
                    return NotFound(new { message = result.ErrorMessage });

                return BadRequest(new { message = result.ErrorMessage, validationErrors = result.ValidationErrors });
            }

            // ✅ Delete image file if it exists
            try
            {
                if (!string.IsNullOrEmpty(gallery.ImageUrl))
                {
                    var folderName = gallery.PrdId != null ? "products" : "dates";
                    var imagePath = Path.Combine("wwwroot/uploads", folderName, gallery.ImageUrl);
                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                        _logger.LogInformation("Deleted image: {ImagePath}", imagePath);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete product image for gallery ID {Id}", galleryId);
                // We won't fail the API here because the DB deletion already succeeded
            }

            return NoContent();
        }
        #endregion Products

        #region Lookups


        [HttpGet]
        [Route("Categories")]
        public async Task<ActionResult<ServiceResult<IEnumerable<LookupItemDto>>>> GetCategories()
        {
            var data = await _productService.GetCategoriesAsync();
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpGet]
        [Route("Types")]
        public async Task<ActionResult<ServiceResult<IEnumerable<LookupItemDto>>>> GetTypes()
        {
            var data = await _productService.GetTypesAsync();
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpGet]
        [Route("Sizes")]
        public async Task<ActionResult<ServiceResult<IEnumerable<LookupItemDto>>>> GetSizes()
        {
            var data = await _productService.GetSizesAsync();
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        #endregion Lookups
    }
}