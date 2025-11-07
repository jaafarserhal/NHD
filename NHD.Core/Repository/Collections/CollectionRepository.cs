using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Collections
{
    public class CollectionRepository : Repository<DatesCollection>, ICollectionRepository
    {
        public CollectionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<DatesCollection>> GetCollectionsAsync(int page, int limit)
        {
            var query = _context.DatesCollections
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();

            var collections = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<DatesCollection>
            {
                Data = collections,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<IEnumerable<DatesCollection>> GetActiveCollectionsAsync()
        {
            return await _context.DatesCollections.Where(c => c.IsActive).ToListAsync();
        }
    }
}