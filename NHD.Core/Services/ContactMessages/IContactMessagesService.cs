using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.ContactMessages;

namespace NHD.Core.Services.ContactMessages
{
    public interface IContactMessagesService
    {
        Task<PagedServiceResult<IEnumerable<ContactMessagesViewModel>>> GetContactMessagesAsync(int page = 1, int limit = 10);
        Task<ServiceResult<ContactMessagesViewModel>> GetViewModelContactByIdAsync(int id);
        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetContactMessageSubjectsAsync();
        Task<ContactMessage> GetContactMessageByIdAsync(int id);
        Task<ContactMessage> AddContactMessageAsync(ContactMessage contactMessage);
        Task<ContactMessage> UpdateContactMessageAsync(ContactMessage contactMessage);
        Task<ServiceResult<bool>> DeleteContactMessageAsync(int contactMessageId);
        Task<ServiceResult<ContactMessage>> SubmitContactAsync(ContactMessagesViewModel model);
    }
}