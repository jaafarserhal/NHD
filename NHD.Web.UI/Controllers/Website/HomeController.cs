using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Dates;
using NHD.Core.Services.Model.Collections;
using NHD.Core.Services.Model.Dates;
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

        private readonly IDatesService _datesService;

        public HomeController(ILogger<HomeController> logger, IProductService productService, ISectionService sectionService, IDatesService datesService)
        {
            _logger = logger;
            _productService = productService ?? throw new ArgumentNullException(nameof(productService));
            _sectionService = sectionService ?? throw new ArgumentNullException(nameof(sectionService));
            _datesService = datesService ?? throw new ArgumentNullException(nameof(datesService));
        }

        [HttpGet("HomeSlider")]
        public async Task<ActionResult<ServiceResult<IEnumerable<SectionViewModel>>>> GetHomeSlider()
        {
            var result = await _sectionService.GetHomeSliderSectionsAsync();
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }


        [HttpGet("HomeCallToActionSection")]
        public async Task<ActionResult<ServiceResult<IEnumerable<SectionViewModel>>>> GetHomeCallToActionSection()
        {
            var result = await _sectionService.GetHomeCallToActionSectionAsync();
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

        [HttpGet("TopFiveDatesWithGalleries")]
        public async Task<ActionResult<ServiceResult<IEnumerable<DatesWithGalleryViewModel>>>> GetTopFiveDatesWithGalleries()
        {
            var result = await _datesService.GetHomePageTopFiveDatesWithGalleriesAsync();
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }

        [HttpGet("Top4Collections")]
        public async Task<ActionResult<ServiceResult<IEnumerable<CollectionViewModel>>>> GetTop4Collections()
        {
            var result = await _datesService.GetTop4CollectionsAsync();
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }
    }
}