using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Dates;
using NHD.Core.Services.Model.Dates;

namespace NHD.Core.Services.Dates
{
    public class DatesService : IDatesService
    {
        private readonly IDatesRepository _datesRepository;

        private readonly ILogger<DatesService> _logger;

        public DatesService(IDatesRepository datesRepository, ILogger<DatesService> logger)
        {
            _datesRepository = datesRepository ?? throw new ArgumentNullException(nameof(datesRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Dates

        public async Task<PagedServiceResult<IEnumerable<DateViewModel>>> GetDatesAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<DateViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _datesRepository.GetDatesAsync(page, limit);
                var dateDtos = pagedResult.Data.Select(MapToDateDto).ToList();

                return PagedServiceResult<IEnumerable<DateViewModel>>.Success(
                    dateDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dates");
                return PagedServiceResult<IEnumerable<DateViewModel>>.Failure("An error occurred while retrieving dates");
            }
        }

        public async Task<Date> GetDateAsync(int id)
        {
            return await _datesRepository.GetByIdAsync(id);
        }

        public async Task<ServiceResult<DateViewModel>> GetDatesByViewModel(int id)
        {
            try
            {
                var date = await _datesRepository.GetByIdAsync(id);
                if (date == null)
                {
                    return ServiceResult<DateViewModel>.Failure($"Date with ID {id} not found.");
                }

                var dateDto = MapToDateDto(date);
                return ServiceResult<DateViewModel>.Success(dateDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving date with ID {id}");
                return ServiceResult<DateViewModel>.Failure("An error occurred while retrieving the date");
            }
        }


        public async Task<Date> AddDateAsync(Date date)
        {
            await _datesRepository.AddAsync(date);
            return date;
        }

        public async Task<Date> UpdateDateAsync(Date date)
        {
            await _datesRepository.UpdateAsync(date);
            return date;
        }

        public async Task<ServiceResult<bool>> DeleteDateAsync(int dateId)
        {
            var date = await _datesRepository.GetByIdAsync(dateId);
            if (date == null)
            {
                return ServiceResult<bool>.Failure($"Date with ID {dateId} not found.");
            }

            await _datesRepository.DeleteAsync(date.DateId);
            return ServiceResult<bool>.Success(true);
        }

        #endregion Products


        #region Mappers
        private DateViewModel MapToDateDto(Date date)
        {
            return new DateViewModel
            {
                Id = date.DateId,
                NameEn = date.NameEn,
                NameSv = date.NameSv,
                IsActive = date.IsActive,
                UnitPrice = date.UnitPrice,
                WeightPrice = date.WeightPrice,
                CreatedAt = date.CreatedAt
            };
        }
        #endregion Mappers
    }
}