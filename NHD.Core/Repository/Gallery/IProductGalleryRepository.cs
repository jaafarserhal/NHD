using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Gallery
{
    public interface IProductGalleryRepository : IRepository<ProductGallery>
    {
        Task<PagedResult<ProductGallery>> GetProductGalleriesAsync(int productId, int page, int limit);
        Task<bool> DeleteProductGalleriesAsync(int productId);

        Task<IEnumerable<ProductGallery>> GetAllGalleriesByProductIdAsync(int productId);
    }
}