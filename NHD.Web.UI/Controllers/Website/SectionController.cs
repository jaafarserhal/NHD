using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Services.Model.Sections;
using NHD.Core.Services.Sections;

namespace NHD.Web.UI.Controllers.Website
{
    [ApiController]
    [Route("api/[controller]")]
    public class SectionController : ControllerBase
    {
        private readonly ILogger<SectionController> _logger;
        private readonly ISectionService _sectionService;

        public SectionController(ILogger<SectionController> logger, ISectionService sectionService)
        {
            _logger = logger;
            _sectionService = sectionService ?? throw new ArgumentNullException(nameof(sectionService));
        }

        [HttpGet("{typeId}/{top}")]
        public async Task<ActionResult<ServiceResult<IEnumerable<SectionViewModel>>>> GetSectionByType(int typeId, int top)
        {
            var result = await _sectionService.GetSectionByTypeAsync(typeId, top);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.ErrorMessage);
        }
    }
}