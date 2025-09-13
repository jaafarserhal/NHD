using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Repository.Base;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Utilities;

namespace NHD.Core.Repository.Lookup
{
    public class LookupRepository : Repository<GenLookup>, ILookupRepository
    {
        public LookupRepository(AppDbContext context) : base(context)
        {
        }
        public async Task<List<GenLookup>> GetLookupsByTypeAsync(int lookupType)
        {
            return await _context.GenLookups
                                 .Where(l => l.LookupTypeId == lookupType)
                                 .ToListAsync();
        }

        public async Task<List<GenLookup>> GetStoresGategory()
        {
            return await GetLookupsByTypeAsync(LookupType.StoreCategory.AsInt());
        }
    }
}