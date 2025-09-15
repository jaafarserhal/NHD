using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Products
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Product>> GetProductsAsync(int page, int limit)
        {
            return await _context.Products
                .Include(p => p.PrdLookupCategory)
                .Include(p => p.PrdLookupType)
                .Include(p => p.PrdLookupSize)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Where(p => p.IsActive == true)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }
    }
}