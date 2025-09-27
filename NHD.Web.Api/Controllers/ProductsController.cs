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
                    IsActive = dto.IsActive,
                    ImageUrl = fileName
                };

                var created = await _productService.AddProductAsync(product);
                return CreatedAtAction("GetProducts", new { id = created.PrdId });
            }
            catch (System.Exception ex)
            {
                // TODO: Handle exception   
                _logger.LogError(ex, "Error adding product");
                return StatusCode(500, "An error occurred while adding the product.");
            }
        }


        [HttpPut]
        [Route("Update")]
        public async Task<IActionResult> UpdateProduct([FromForm] ProductBindingModel dto)
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

            // Handle new image upload if provided
            if (dto.ImageUrl != null && dto.ImageUrl.Length > 0)
            {
                // Optional: delete old image file
                var imagePath = existingProduct.ImageUrl;
                if (!string.IsNullOrEmpty(imagePath))
                {
                    var oldImagePath = Path.Combine("wwwroot/uploads/products", imagePath);
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                // Save new image
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageUrl.FileName)}";
                var folderPath = Path.Combine("wwwroot/uploads", "products");
                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var filePath = Path.Combine(folderPath, fileName);
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
            existingProduct.IsActive = dto.IsActive;
            existingProduct.CreatedAt = DateTime.UtcNow;

            // Save changes
            var updatedProduct = await _productService.UpdateProductAsync(existingProduct);

            return Ok(updatedProduct.PrdId);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteProductAsync(id);

            if (!result.IsSuccess)
            {
                if (result.ErrorMessage?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
                    return NotFound(new { message = result.ErrorMessage });

                return BadRequest(new { message = result.ErrorMessage, validationErrors = result.ValidationErrors });
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