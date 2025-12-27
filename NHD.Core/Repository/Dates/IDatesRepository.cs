using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Dates
{
    public interface IDatesRepository : IRepository<Date>
    {
        Task<PagedResult<Date>> GetDatesAsync(int page, int limit);
        Task<Date> GetDateByIdAsync(int dateId);
        Task<IEnumerable<Date>> GetActiveDatesAsync();
        Task<IEnumerable<Date>> GetBannerDatesAsync(int take);
        Task<IEnumerable<Date>> GetFillDatesAsync(int take);
    }
}