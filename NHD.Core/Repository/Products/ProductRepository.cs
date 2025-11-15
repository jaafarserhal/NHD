using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;
using NHD.Core.Utilities;

namespace NHD.Core.Repository.Products
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<Product>> GetProductsAsync(int page, int limit)
        {
            var query = _context.Products
                .Include(p => p.PrdLookupCategory)
                .Include(p => p.PrdLookupType)
                .Include(p => p.PrdLookupSize)
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();

            var products = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<Product>
            {
                Data = products,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<Product> GetProductByIdAsync(int productId)
        {
            return await _context.Products
                .Include(p => p.PrdLookupCategory)
                .Include(p => p.PrdLookupType)
                .Include(p => p.PrdLookupSize)
                .Include(p => p.DatesProducts)
                .Include(p => p.ProductCollections)
                .FirstOrDefaultAsync(p => p.PrdId == productId);
        }

        public async Task<IEnumerable<Product>> GetCarouselProductsAsync()
        {
            return await _context.Products
                .Where(p => p.IsCarousel == true && p.IsActive == true)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetProductsByTypeAsync(int typeId, int take)
        {
            return await _context.Products
                .Where(p => p.PrdLookupTypeId == typeId && p.IsActive == true)
                .Include(p => p.Galleries)
                .Include(p => p.PrdLookupCategory)
                .Include(p => p.PrdLookupSize)
                .OrderByDescending(p => p.CreatedAt)
                .Take(take)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId, bool IsCarousel, int take)
        {
            return await _context.Products
                .Where(p => p.PrdLookupCategoryId == categoryId && p.IsActive == true && p.IsCarousel == IsCarousel)
                .Include(p => p.Galleries)
                .Include(p => p.PrdLookupType)
                .Include(p => p.PrdLookupSize)
                .OrderByDescending(p => p.CreatedAt)
                .Take(take)
                .ToListAsync();
        }
        public async Task<IEnumerable<Product>> GetHomeProductsByCategoryAsync(int categoryId = 0)
        {
            IQueryable<Product> BuildBaseQuery() => _context.Products
            .Where(p => p.IsActive == true)
            .Include(p => p.Galleries)
            .Include(p => p.PrdLookupType)
            .Include(p => p.PrdLookupSize)
            .OrderByDescending(p => p.CreatedAt)
            .AsQueryable();

            // Specific category — filter and return
            if (categoryId != 0)
            {
                return await BuildBaseQuery()
                    .Where(p => p.PrdLookupCategoryId == categoryId)
                    .ToListAsync();
            }

            // Use BuildBaseQuery for consistency
            async Task<List<Product>> GetRandomProductsAsync(int catId, int count) =>
                await BuildBaseQuery()
                    .Where(p => p.PrdLookupCategoryId == catId)
                    .OrderBy(p => Guid.NewGuid()) // Randomize
                    .Take(count)
                    .ToListAsync();

            var products = new List<Product>();

            // Define which categories to sample from and how many
            var categorySelections = new (int CategoryId, int Count)[]
            {
                (BoxCategoryEnum.SignatureDates.AsInt(), 2),
                (BoxCategoryEnum.ClassicDatePouches.AsInt(), 2),
                (BoxCategoryEnum.DateSnacks.AsInt(), 2),
                (BoxCategoryEnum.SignatureDateGifts.AsInt(), 1),
                (BoxCategoryEnum.DateSweetners.AsInt(), 1)
            };

            foreach (var (catId, count) in categorySelections)
            {
                products.AddRange(await GetRandomProductsAsync(catId, count));
            }

            return products;
        }
    }
}