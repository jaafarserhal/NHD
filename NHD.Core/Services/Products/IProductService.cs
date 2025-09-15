using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Services.Model;

namespace NHD.Core.Services.Products
{
    public interface IProductService
    {
        Task<ServiceResult<IEnumerable<ProductViewModel>>> GetProductsAsync(int page = 1, int limit = 10);
    }
}