using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Services.ContactMessages;

namespace NHD.Web.UI.Controllers.Portal
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IContactMessagesService _contactService;
        private readonly ILogger<ContactController> _logger;

        public ContactController(IContactMessagesService contactService, ILogger<ContactController> logger)
        {
            _contactService = contactService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult> GetContacts([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _contactService.GetContactMessagesAsync(page, limit);

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
        [HttpGet("export")]
        public async Task<ActionResult> ExportContacts()
        {
            try
            {
                var result = await _contactService.GetAllContactMessagesAsync();

                if (!result.IsSuccess)
                    return BadRequest(new { message = result.ErrorMessage });

                using (var workbook = new ClosedXML.Excel.XLWorkbook())
                {
                    var worksheet = workbook.AddWorksheet("Contacts");

                    // Headers
                    worksheet.Cell(1, 1).Value = "Date";
                    worksheet.Cell(1, 2).Value = "First Name";
                    worksheet.Cell(1, 3).Value = "Last Name";
                    worksheet.Cell(1, 4).Value = "Email";
                    worksheet.Cell(1, 5).Value = "Subject";
                    worksheet.Cell(1, 6).Value = "Message";

                    // Style headers
                    var headerRange = worksheet.Range(1, 1, 1, 6);
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;

                    // Data
                    int row = 2;
                    foreach (var c in result.Data)
                    {
                        worksheet.Cell(row, 1).Value = c.CreatedAt;
                        worksheet.Cell(row, 1).Style.DateFormat.Format = "yyyy-MM-dd HH:mm";

                        worksheet.Cell(row, 2).Value = c.FirstName;
                        worksheet.Cell(row, 3).Value = c.LastName;
                        worksheet.Cell(row, 4).Value = c.Email;
                        worksheet.Cell(row, 5).Value = c.Subject;
                        worksheet.Cell(row, 6).Value = c.Message;

                        row++;
                    }

                    worksheet.Columns().AdjustToContents();

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();

                        var fileName = $"Contacts_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                        return File(
                            content,
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            fileName
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting contacts to Excel");
                return StatusCode(500, "An error occurred while exporting contacts.");
            }
        }
    }
}