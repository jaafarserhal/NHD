using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.ImageGallery
{
    public class GalleryRepository : Repository<Gallery>, IGalleryRepository
    {
        public GalleryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<Gallery>> GetGalleriesAsync(int? productId, int? dateId, int page, int limit)
        {
            var query = _context.Galleries
                .Include(pg => pg.Prd)
                .Include(pg => pg.Date)
                .AsQueryable();
            if (productId.HasValue)
            {
                query = query.Where(pg => pg.PrdId == productId.Value).OrderByDescending(pg => pg.SortOrder);
            }
            if (dateId.HasValue)
            {
                query = query.Where(pg => pg.DateId == dateId.Value).OrderByDescending(pg => pg.SortOrder);
            }

            var total = await query.CountAsync();

            var productGalleries = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<Gallery>
            {
                Data = productGalleries,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<bool> DeleteGalleriesAsync(int? productId, int? dateId)
        {
            var query = _context.Galleries.AsQueryable();

            if (productId.HasValue)
            {
                query = query.Where(pg => pg.PrdId == productId.Value);
            }

            if (dateId.HasValue)
            {
                query = query.Where(pg => pg.DateId == dateId.Value);
            }

            var galleries = await query.ToListAsync();

            if (galleries.Any())
            {
                _context.Galleries.RemoveRange(galleries);
                await _context.SaveChangesAsync();
            }
            return true;
        }


        public async Task<IEnumerable<Gallery>> GetAllGalleriesByProductIdOrDateIdAsync(int? productId, int? dateId)
        {
            var query = _context.Galleries.AsQueryable();

            if (dateId.HasValue)
            {
                query = query.Where(pg => pg.DateId == dateId.Value);
            }
            else
            {
                query = query.Where(pg => pg.PrdId == productId.Value);
            }
            return await query.ToListAsync();
        }
    }
}