using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Dates;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Collections;
using NHD.Core.Services.Model.Dates;
using NHD.Core.Services.Model.Products;
using NHD.Core.Services.Model.Sections;
using NHD.Core.Services.Products;
using NHD.Core.Services.Sections;
using NHD.Core.Services.Subscribe;
using NHD.Core.Utilities;

namespace NHD.Web.UI.Website.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IProductService _productService;

        private readonly IDatesService _datesService;

        private readonly IEmailSubscriptionService _emailSubscriptionService;

        public HomeController(ILogger<HomeController> logger, IProductService productService, IDatesService datesService, IEmailSubscriptionService emailSubscriptionService)
        {
            _logger = logger;
            _productService = productService ?? throw new ArgumentNullException(nameof(productService));
            _datesService = datesService ?? throw new ArgumentNullException(nameof(datesService));
            _emailSubscriptionService = emailSubscriptionService ?? throw new ArgumentNullException(nameof(emailSubscriptionService));
        }

        [HttpGet("SignatureGiftsProducts")]
        public async Task<ActionResult<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>>> GetProductsByCategory()
        {
            var result = await _productService.GetProductsByCategoryAsync(BoxCategoryLookup.SignatureDateGifts.AsInt(), false, 3);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }

        [HttpGet("TopFiveBannerDates")]
        public async Task<ActionResult<ServiceResult<IEnumerable<DatesWithGalleryViewModel>>>> GetTopFiveBannerDates()
        {
            var result = await _datesService.GetBannerDatesAsync();
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

        [HttpGet]
        [Route("Categories")]
        public async Task<ActionResult<ServiceResult<IEnumerable<LookupItemDto>>>> GetCategories()
        {
            var data = await _productService.GetCategoriesAsync();
            if (data.IsSuccess)
            {
                data.Data = new[] { new LookupItemDto { Id = 0, NameEn = "All", NameSv = "Alla" } }
                            .Concat(data.Data);

                return Ok(data.Data);
            }
            return BadRequest(data);
        }

        [HttpGet("HomeProducts/{categoryId?}")]
        public async Task<ActionResult<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>>> GetHomeProductsByCategory(int categoryId = 0)
        {
            var result = await _productService.GetHomeProductsByCategoryAsync(categoryId);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }

        [HttpGet("FillDatesProducts")]
        public async Task<ActionResult<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>>> GetFillDatesProducts()
        {
            var result = await _productService.GetFillDatesProducts();
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }

        [HttpPost("SubscribeEmail")]
        public async Task<ActionResult<ServiceResult<EmailSubscription>>> SubscribeEmail([FromBody] string email)
        {

            var result = await _emailSubscriptionService.SubscribeAsync(email);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }
    }
}