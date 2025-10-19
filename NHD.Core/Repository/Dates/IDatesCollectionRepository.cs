using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Dates
{
    public interface IDatesCollectionRepository : IRepository<DatesCollection>
    {
        Task<PagedResult<DatesCollection>> GetCollectionsAsync(int page, int limit);
        Task<IEnumerable<DatesCollection>> GetActiveCollectionsAsync();
    }
}