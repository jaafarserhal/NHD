using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Collections
{
    public interface ICollectionRepository : IRepository<Collection>
    {
        Task<PagedResult<Collection>> GetCollectionsAsync(int page, int limit);
        Task<IEnumerable<Collection>> GetActiveCollectionsAsync();
        Task<IEnumerable<Collection>> GetTopCollectionsAsync(int take);
    }
}