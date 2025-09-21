using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Products;

namespace NHD.Core.Services.Products
{
    public interface IProductService
    {
        Task<ServiceResult<IEnumerable<ProductViewModel>>> GetProductsAsync(int page = 1, int limit = 10);
        Task<Product> AddProductAsync(Product product);
        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetCategoriesAsync();
        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetTypesAsync();
        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetSizesAsync();
    }
}