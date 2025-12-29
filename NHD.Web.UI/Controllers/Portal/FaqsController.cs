using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.FAQ;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.FAQ;
using NHD.Core.Utilities;

namespace NHD.Web.UI.Controllers.Portal
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaqsController : ControllerBase
    {
        private readonly ILogger<FaqsController> _logger;
        private readonly IFAQService _faqService;

        public FaqsController(ILogger<FaqsController> logger, IFAQService faqService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _faqService = faqService ?? throw new ArgumentNullException(nameof(faqService));
        }

        [HttpGet]
        public async Task<ActionResult> GetFaqs([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _faqService.GetFaqsAsync(page, limit);

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
        public async Task<ActionResult<ServiceResult<FAQViewModel>>> GetFaqById(int id)
        {
            var data = await _faqService.GetFAQViewModelByIdAsync(id);
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }

        [HttpPost]
        [Route("Add")]
        public async Task<IActionResult> AddFaq([FromBody] FAQViewModel dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("FAQ data is required");

                var faq = new Faq
                {
                    QuestionEn = dto.QuestionEn,
                    QuestionSv = dto.QuestionSv,
                    AnswerEn = dto.AnswerEn,
                    AnswerSv = dto.AnswerSv,
                    TypeLookupId = dto.TypeId,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _faqService.AddFaq(faq);
                return CreatedAtAction("GetFaqs", new { id = created.FaqId }, created);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error adding FAQ");
                return StatusCode(HttpStatusCodeEnum.InternalServerError.AsInt(), "An error occurred while adding the FAQ.");
            }
        }

        [HttpPut]
        [Route("Update")]
        public async Task<IActionResult> UpdateFaq([FromBody] FAQViewModel dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("FAQ data is required");
                var existingFaq = await _faqService.GetFAQByIdAsync(dto.Id);
                if (existingFaq == null)
                    return NotFound($"FAQ with ID {dto.Id} not found.");

                existingFaq.QuestionEn = dto.QuestionEn;
                existingFaq.QuestionSv = dto.QuestionSv;
                existingFaq.AnswerEn = dto.AnswerEn;
                existingFaq.AnswerSv = dto.AnswerSv;
                existingFaq.TypeLookupId = dto.TypeId;
                existingFaq.IsActive = dto.IsActive;
                existingFaq.CreatedAt = DateTime.UtcNow;

                var updated = await _faqService.UpdateFaqAsync(existingFaq);
                return Ok(updated);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error updating FAQ");
                return StatusCode(HttpStatusCodeEnum.InternalServerError.AsInt(), "An error occurred while updating the FAQ.");
            }
        }

        [HttpDelete]
        [Route("Delete/{id}")]
        public async Task<IActionResult> DeleteFaq(int id)
        {
            var result = await _faqService.DeleteFaqAsync(id);

            if (!result.IsSuccess)
            {
                if (result.ErrorMessage?.Contains("not found", StringComparison.OrdinalIgnoreCase) == true)
                    return NotFound(new { message = result.ErrorMessage });

                return BadRequest(new { message = result.ErrorMessage, validationErrors = result.ValidationErrors });
            }

            return NoContent();
        }

        [HttpGet]
        [Route("Types")]
        public async Task<ActionResult<ServiceResult<IEnumerable<LookupItemDto>>>> GetTypes()
        {
            var data = await _faqService.GetFaqTypesAsync();
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }
    }
}