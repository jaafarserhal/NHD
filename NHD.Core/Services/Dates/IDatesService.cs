using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model.Dates;

namespace NHD.Core.Services.Dates
{
    public interface IDatesService
    {
        Task<PagedServiceResult<IEnumerable<DateViewModel>>> GetDatesAsync(int page = 1, int limit = 10);
        Task<ServiceResult<DateViewModel>> GetDatesByViewModel(int id);
        Task<Date> GetDateAsync(int id);
        Task<Date> AddDateAsync(Date date);
        Task<Date> UpdateDateAsync(Date date);
        Task<ServiceResult<bool>> DeleteDateAsync(int dateId);
        Task<PagedServiceResult<IEnumerable<DatesCollectionViewModel>>> GetDatesCollectionAsync(int page = 1, int limit = 10);
        Task<DatesCollection> AddCollectionAsync(DatesCollection collection);
        Task<DatesCollection> UpdateCollectionAsync(DatesCollection collection);
        Task<ServiceResult<bool>> DeleteCollectionAsync(int collectionId);
        Task<DatesCollection> GetCollectionAsync(int id);
        Task<ServiceResult<DatesCollectionViewModel>> GetCollectionByViewModel(int id);
    }
}