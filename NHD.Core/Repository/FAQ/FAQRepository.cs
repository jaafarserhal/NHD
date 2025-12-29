using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.FAQ
{
    public class FAQRepository : Repository<Faq>, IFAQRepository
    {
        public FAQRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<Faq>> GetFAQAsync(int page, int limit)
        {
            var query = _context.Faqs
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();

            var faqs = await query
                .Include(cm => cm.TypeLookup)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<Faq>
            {
                Data = faqs,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<Faq> GetFAQByIdAsync(int id)
        {
            return await _context.Faqs
                .Include(cm => cm.TypeLookup)
                .FirstOrDefaultAsync(f => f.FaqId == id);
        }

        public async Task<IEnumerable<Faq>> GetFAQsByTypeAsync(int type)
        {
            return await _context.Faqs
                .Include(cm => cm.TypeLookup)
                .Where(f => f.TypeLookupId == type && f.IsActive == true)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

    }
}