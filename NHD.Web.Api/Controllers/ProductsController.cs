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

        public async Task<ActionResult<ServiceResult<IEnumerable<ProductViewModel>>>> GetProducts([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var data = await _productService.GetProductsAsync(page, limit);
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

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

        [HttpPost]
        [Route("Add")]
        public async Task<IActionResult> AddProduct([FromForm] ProductBindingModel dto)
        {
            if (dto == null)
            {
                return BadRequest("Product data is required");
            }

            if (dto.ImageUrl == null || dto.ImageUrl.Length == 0)
                return BadRequest("Image is required");

            // Create unique file name
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.ImageUrl.FileName)}";
            var folderPath = Path.Combine("wwwroot/uploads", "products");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.ImageUrl.CopyToAsync(stream);
            }

            var product = new Product
            {
                PrdLookupCategoryId = dto.CategoryId,
                PrdLookupTypeId = dto.TypeId,
                PrdLookupSizeId = dto.SizeId,
                NameEn = dto.NameEn,
                NameSv = dto.NameSv,
                DescriptionEn = dto.DescriptionEn,
                DescriptionSv = dto.DescriptionSv,
                Price = dto.Price,
                IsActive = dto.IsActive,
                ImageUrl = fileName
            };

            var created = await _productService.AddProductAsync(product);
            return CreatedAtAction("GetProducts", new { id = created.PrdId }, created);
        }
    }
}