using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.ImageGallery
{
    public interface IGalleryRepository : IRepository<Gallery>
    {
        Task<PagedResult<Gallery>> GetGalleriesAsync(int? productId, int? dateId, int page, int limit);
        Task<bool> DeleteGalleriesAsync(int? productId, int? dateId);
        Task<IEnumerable<Gallery>> GetAllGalleriesByProductIdOrDateIdAsync(int? productId, int? dateId);
    }
}