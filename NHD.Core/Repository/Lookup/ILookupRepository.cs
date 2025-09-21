using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Repository.Base;
using NHD.Core.Models;

namespace NHD.Core.Repository.Lookup
{
    public interface ILookupRepository : IRepository<GenLookup>
    {
        Task<List<GenLookup>> GetLookupsByTypeAsync(int lookupType);

        Task<List<GenLookup>> GetProductCategoriesAsync();
        Task<List<GenLookup>> GetProductTypesAsync();
        Task<List<GenLookup>> GetProductSizesAsync();

    }
}