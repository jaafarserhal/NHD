using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Collections
{
    public class ProductCollectionRepository : Repository<ProductCollection>, IProductCollectionRepository
    {
        public ProductCollectionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<List<ProductCollection>> GetByProductIdAsync(int productId)
        {
            return await Task.FromResult(_context.ProductCollections.Where(pc => pc.ProductId == productId).ToList());
        }
    }
}