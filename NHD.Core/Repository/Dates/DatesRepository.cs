using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Dates
{
    public class DatesRepository : Repository<Date>, IDatesRepository
    {
        public DatesRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<Date>> GetDatesAsync(int page, int limit)
        {
            var query = _context.Dates
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();

            var dates = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<Date>
            {
                Data = dates,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<Date> GetDateByIdAsync(int dateId)
        {
            return await _context.Dates
                .FirstOrDefaultAsync(p => p.DateId == dateId);
        }

        public async Task<IEnumerable<Date>> GetActiveDatesAsync()
        {
            return await _context.Dates
                .Where(d => d.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Date>> GetTopDatesWithGalleriesAsync(int take)
        {
            return await _context.Dates
                .Include(d => d.Galleries)
                .Where(d => d.IsActive)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<Date>> GetFillDatesAsync(int take)
        {
            return await _context.Dates
                .Where(d => d.IsActive == true && d.IsFilled == true)
                .Take(take)
                .ToListAsync();
        }
    }
}