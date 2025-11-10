using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Repository.Base;
using NHD.Core.Models;
using NHD.Core.Data;

namespace NHD.Core.Repository.Sections
{
    public class SectionRepository : Repository<Section>, ISectionRepository
    {
        public SectionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<Section>> GetSectionsAsync(int page, int limit)
        {
            var query = _context.Sections
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();

            var sections = await query
                .Include(p => p.TypeLookup)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<Section>
            {
                Data = sections,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<Section> GetSectionByIdAsync(int sectionId)
        {
            return await _context.Sections.Include(p => p.TypeLookup)
                .FirstOrDefaultAsync(p => p.SectionId == sectionId);
        }

        public async Task<IEnumerable<Section>> GetTopSectionsByTypeAsync(int typeId, int take)
        {
            return await _context.Sections.Include(p => p.TypeLookup)
                .Where(p => p.IsActive == true && p.TypeLookupId == typeId)
                .OrderByDescending(p => p.CreatedAt)
                .Take(take)
                .ToListAsync();
        }
    }
}