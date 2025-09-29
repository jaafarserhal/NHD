using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;
using NHD.Core.Repository.DateProducts;

namespace NHD.Core.Repository.DateProducts
{
    public class DateProductsRepository : Repository<DatesProduct>, IDateProductsRepository
    {
        public DateProductsRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<List<DatesProduct>> GetByProductIdAsync(int productId)
        {
            return await Task.FromResult(_context.DatesProducts.Where(dp => dp.PrdId == productId).ToList());
        }
    }
}