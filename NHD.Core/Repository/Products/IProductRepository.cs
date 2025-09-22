using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Products
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<PagedResult<Product>> GetProductsAsync(int page, int limit);
    }
}