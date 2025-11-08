using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model.Products;
using NHD.Core.Services.Model.Sections;
using NHD.Core.Services.Products;
using NHD.Core.Services.Sections;
using NHD.Core.Utilities;

namespace NHD.Web.UI.Website.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IProductService _productService;
        private readonly ISectionService _sectionService;

        public HomeController(ILogger<HomeController> logger, IProductService productService, ISectionService sectionService)
        {
            _logger = logger;
            _productService = productService ?? throw new ArgumentNullException(nameof(productService));
            _sectionService = sectionService ?? throw new ArgumentNullException(nameof(sectionService));
        }

        [HttpGet("Carousel")]
        public async Task<ActionResult<ServiceResult<IEnumerable<SectionViewModel>>>> GetCarousel()
        {
            var result = await _sectionService.GetHomeSliderSectionsAsync(2);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }

        [HttpGet("SignatureGiftsProducts")]
        public async Task<ActionResult<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>>> GetProductsByCategory()
        {
            var result = await _productService.GetProductsByCategoryAsync(BoxCategoryEnum.SignatureDateGifts.AsInt(), false, 3);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }
    }
}