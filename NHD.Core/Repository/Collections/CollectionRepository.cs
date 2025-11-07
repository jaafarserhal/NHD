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
    public class CollectionRepository : Repository<Collection>, ICollectionRepository
    {
        public CollectionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<Collection>> GetCollectionsAsync(int page, int limit)
        {
            var query = _context.Collections
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();

            var collections = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<Collection>
            {
                Data = collections,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<IEnumerable<Collection>> GetActiveCollectionsAsync()
        {
            return await _context.Collections.Where(c => c.IsActive).ToListAsync();
        }
    }
}