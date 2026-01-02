using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Dates;
using NHD.Core.Services.Model.Products;

namespace NHD.Core.Services.Products
{
    public interface IProductService
    {
        Task<PagedServiceResult<IEnumerable<ProductViewModel>>> GetProductsAsync(int page = 1, int limit = 10);
        Task<ServiceResult<ProductViewModel>> GetProductWithDetailsByIdAsync(int productId);
        Task<Product> GetProductAsync(int id);
        Task<Product> AddProductAsync(Product product);
        Task<Product> UpdateProductAsync(Product product);
        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetCategoriesAsync();
        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetTypesAsync();
        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetSizesAsync();
        Task<ServiceResult<bool>> DeleteProductAsync(int productId);
        Task<Product> SaveProductWithDatesAsync(Product product, List<DatesProductBindingModel> datesProducts, List<ProductCollectionBindingModel> productCollections);

        Task<ServiceResult<IEnumerable<DateViewModel>>> GetAllDatesAsync();
        Task<PagedServiceResult<IEnumerable<GalleryViewModel>>> GetGalleriesAsync(int? productId, int? dateId, int page = 1, int limit = 10);
        Task<Gallery> AddGalleryAsync(Gallery gallery);
        Task<ServiceResult<bool>> DeleteGalleryAsync(int galleryId);

        Task<ServiceResult<bool>> DeleteGalleryAsync(int? productId, int? dateId);

        Task<Gallery> GetGalleryAsync(int id);

        Task<ServiceResult<IEnumerable<ProductViewModel>>> GetCarouselProductsAsync();

        Task<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>> GetProductsByCategoryAsync(int categoryId, bool isCarousel, int take);

        Task<ServiceResult<IEnumerable<LookupItemDto>>> GetActiveCollectionsAsync();

        Task<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>> GetHomeProductsByCategoryAsync(int categoryId = 0);
        Task<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>> GetFillDatesProducts();
        Task<PagedServiceResult<IEnumerable<ProductsWithGalleryViewModel>>> GetAllProductsByCategoryAsync(int page, int limit, int category = 0, string? search = "");
        Task<ServiceResult<ProductsWithGalleryViewModel>> GetProductDetailsWithGalleryByIdAsync(int productId);
    }
}