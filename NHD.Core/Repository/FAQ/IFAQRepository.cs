using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.FAQ
{
    public interface IFAQRepository : IRepository<Faq>
    {
        Task<PagedResult<Faq>> GetFAQAsync(int page, int limit);
        Task<Faq> GetFAQByIdAsync(int id);
        Task<IEnumerable<Faq>> GetFAQsByTypeAsync(int type);
    }
}