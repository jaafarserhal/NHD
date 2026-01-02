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
        Task<Product> GetProductByIdAsync(int productId);
        Task<Product> GetProductWithGalleryByIdAsync(int productId);

        Task<IEnumerable<Product>> GetCarouselProductsAsync();
        Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId, bool IsCarousel, int take);
        Task<IEnumerable<Product>> GetHomeProductsByCategoryAsync(int categoryId = 0);
        Task<IEnumerable<Product>> GetProductsByTypeAsync(int typeId, int take);
        Task<PagedResult<Product>> GetAllProductsAsync(int page, int limit, int category = 0, string? search = "");
    }
}