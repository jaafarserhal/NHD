using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Gallery
{
    public class ProductGalleryRepository : Repository<ProductGallery>, IProductGalleryRepository
    {
        public ProductGalleryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<ProductGallery>> GetProductGalleriesAsync(int productId, int page, int limit)
        {
            var query = _context.ProductGalleries
                .Include(pg => pg.Prd)
                .Where(pg => pg.PrdId == productId)
                .OrderByDescending(pg => pg.SortOrder);

            var total = await query.CountAsync();

            var productGalleries = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<ProductGallery>
            {
                Data = productGalleries,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<bool> DeleteProductGalleriesAsync(int productId)
        {
            var galleries = await _context.ProductGalleries
                .Where(pg => pg.PrdId == productId)
                .ToListAsync();

            if (galleries.Any())
            {
                _context.ProductGalleries.RemoveRange(galleries);
                await _context.SaveChangesAsync();
            }
            return true;
        }

        public async Task<IEnumerable<ProductGallery>> GetAllGalleriesByProductIdAsync(int productId)
        {
            return await _context.ProductGalleries
                .Where(pg => pg.PrdId == productId)
                .OrderByDescending(pg => pg.SortOrder)
                .ToListAsync();
        }
    }
}