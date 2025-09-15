using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Services.Model;
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

    }
}