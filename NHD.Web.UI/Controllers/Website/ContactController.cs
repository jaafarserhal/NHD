using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.ContactMessages;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.ContactMessages;

namespace NHD.Web.UI.Controllers.Website
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly ILogger<ContactController> _logger;
        private readonly IContactMessagesService _contactMessagesService;

        public ContactController(ILogger<ContactController> logger, IContactMessagesService contactMessagesService)
        {
            _logger = logger;
            _contactMessagesService = contactMessagesService ?? throw new ArgumentNullException(nameof(contactMessagesService));
        }

        [HttpPost("SubmitContact")]
        public async Task<ActionResult<ServiceResult<ContactMessage>>> SubmitContact([FromBody] ContactMessagesViewModel model)
        {
            var result = await _contactMessagesService.SubmitContactAsync(model);
            if (result.IsSuccess)
            {
                return Ok("Your message has been submitted successfully, an email confirmation has been sent to you.");
            }
            return BadRequest(result.ErrorMessage);
        }

        [HttpGet("Subjects")]
        public async Task<ActionResult<ServiceResult<IEnumerable<LookupItemDto>>>> GetSubjects()
        {
            var data = await _contactMessagesService.GetContactMessageSubjectsAsync();
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }
    }
}