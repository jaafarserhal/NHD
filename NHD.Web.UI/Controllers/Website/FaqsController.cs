using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Services.FAQ;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.FAQ;

namespace NHD.Web.UI.Controllers.Website
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaqsController : ControllerBase
    {
        private readonly IFAQService _faqService;
        private readonly ILogger<FaqsController> _logger;

        public FaqsController(IFAQService faqService, ILogger<FaqsController> logger)
        {
            _faqService = faqService ?? throw new ArgumentNullException(nameof(faqService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("{typeId}")]
        public async Task<ServiceResult<IEnumerable<FAQViewModel>>> GetFAQsByTypeAsync(int typeId)
        {
            try
            {
                if (typeId <= 0)
                {
                    return ServiceResult<IEnumerable<FAQViewModel>>.Failure("TypeId must be greater than 0");
                }

                var result = await _faqService.GetFAQsByTypeAsync(typeId);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FAQs by type");
                return ServiceResult<IEnumerable<FAQViewModel>>.Failure("An error occurred while retrieving FAQs by type");
            }
        }
        [HttpGet]
        [Route("FaqTypes")]
        public async Task<ActionResult<ServiceResult<IEnumerable<LookupItemDto>>>> GetTypes()
        {
            var data = await _faqService.GetFaqTypesAsync();
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }
    }
}