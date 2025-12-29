using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.FAQ;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.FAQ;

namespace NHD.Core.Services.FAQ
{
    public interface IFAQService
    {
        Task<PagedServiceResult<IEnumerable<FAQViewModel>>> GetFaqsAsync(int page = 1, int limit = 10);
        Task<ServiceResult<FAQViewModel>> GetFAQViewModelByIdAsync(int id);
        Task<Faq> GetFAQByIdAsync(int id);
        Task<ServiceResult<bool>> DeleteFaqAsync(int faqId);
        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetFaqTypesAsync();
        Task<Faq> AddFaq(Faq faq);
        Task<Faq> UpdateFaqAsync(Faq faq);
        Task<ServiceResult<IEnumerable<FAQViewModel>>> GetFAQsByTypeAsync(int type);
    }
}