using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Services.Model;
using NHD.Core.Services.Products;

namespace NHD.Web.UI.Controllers.Website
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductController> _logger;
        public ProductController(IProductService productService, ILogger<ProductController> logger)
        {
            _productService = productService ?? throw new ArgumentNullException(nameof(productService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }


        [HttpGet("AllProductsByCategory")]
        public async Task<ActionResult> GetAllProductsByCategory([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] int category = 0, [FromQuery] string? search = "")
        {
            var result = await _productService.GetAllProductsByCategoryAsync(page, limit, category, search);

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
        [Route("Categories")]
        public async Task<ActionResult<ServiceResult<IEnumerable<LookupItemDto>>>> GetCategories()
        {
            var data = await _productService.GetCategoriesAsync();
            if (data.IsSuccess)
            {
                data.Data = new[] { new LookupItemDto { Id = 0, NameEn = "All", NameSv = "Alla" } }
                            .Concat(data.Data);

                return Ok(data);
            }
            return BadRequest(data);
        }
    }
}