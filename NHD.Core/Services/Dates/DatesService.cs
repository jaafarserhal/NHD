using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Dates;
using NHD.Core.Repository.ImageGallery;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Dates;

namespace NHD.Core.Services.Dates
{
    public class DatesService : IDatesService
    {
        private readonly IDatesRepository _datesRepository;
        private readonly IDatesCollectionRepository _datesCollectionRepository;
        private readonly IGalleryRepository _galleryRepository;

        private readonly ILogger<DatesService> _logger;

        public DatesService(IDatesRepository datesRepository, IDatesCollectionRepository datesCollectionRepository, IGalleryRepository galleryRepository, ILogger<DatesService> logger)
        {
            _datesRepository = datesRepository ?? throw new ArgumentNullException(nameof(datesRepository));
            _datesCollectionRepository = datesCollectionRepository ?? throw new ArgumentNullException(nameof(datesCollectionRepository));
            _galleryRepository = galleryRepository ?? throw new ArgumentNullException(nameof(galleryRepository));
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

        public async Task<PagedServiceResult<IEnumerable<DatesCollectionViewModel>>> GetDatesCollectionAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<DatesCollectionViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _datesCollectionRepository.GetCollectionsAsync(page, limit);
                var collectionDtos = pagedResult.Data.Select(MapToDatesCollectionDto).ToList();

                return PagedServiceResult<IEnumerable<DatesCollectionViewModel>>.Success(
                    collectionDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dates collections");
                return PagedServiceResult<IEnumerable<DatesCollectionViewModel>>.Failure("An error occurred while retrieving dates collections");
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

        public async Task<ServiceResult<DatesCollectionViewModel>> GetCollectionByViewModel(int id)
        {
            try
            {
                var collection = await _datesCollectionRepository.GetByIdAsync(id);
                if (collection == null)
                {
                    return ServiceResult<DatesCollectionViewModel>.Failure($"Collection with ID {id} not found.");
                }

                var collectionDto = MapToDatesCollectionDto(collection);
                return ServiceResult<DatesCollectionViewModel>.Success(collectionDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving collection with ID {id}");
                return ServiceResult<DatesCollectionViewModel>.Failure("An error occurred while retrieving the collection");
            }
        }

        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetCollectionsAsync()
        {
            try
            {
                var collections = await _datesCollectionRepository.GetActiveCollectionsAsync();
                var collectionDtos = collections.Select(c => new LookupItemDto
                {
                    Id = c.CollectionId,
                    NameEn = c.NameEn,
                    NameSv = c.NameSv
                });
                return ServiceResult<IEnumerable<LookupItemDto>>.Success(collectionDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving date collections");
                return ServiceResult<IEnumerable<LookupItemDto>>.Failure("An error occurred while retrieving date collections");
            }
        }

        public async Task<DatesCollection> GetCollectionAsync(int id)
        {
            return await _datesCollectionRepository.GetByIdAsync(id);
        }

        public async Task<DatesCollection> AddCollectionAsync(DatesCollection collection)
        {
            await _datesCollectionRepository.AddAsync(collection);
            return collection;
        }

        public async Task<DatesCollection> UpdateCollectionAsync(DatesCollection collection)
        {
            await _datesCollectionRepository.UpdateAsync(collection);
            return collection;
        }

        public async Task<ServiceResult<bool>> DeleteCollectionAsync(int collectionId)
        {
            var collection = await _datesCollectionRepository.GetByIdAsync(collectionId);
            if (collection == null)
            {
                return ServiceResult<bool>.Failure($"Collection with ID {collectionId} not found.");
            }

            await _datesCollectionRepository.DeleteAsync(collection.CollectionId);
            return ServiceResult<bool>.Success(true);
        }

        #endregion Dates


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

            // Step 1: Get gallery image paths before deleting from DB
            var galleries = await _galleryRepository.GetAllGalleriesByProductIdOrDateIdAsync(null, dateId);
            var imagePaths = galleries
                .Where(g => !string.IsNullOrEmpty(g.ImageUrl))
                .Select(g => Path.Combine("wwwroot/uploads/dates", g.ImageUrl.TrimStart('/')))
                .ToList();

            try
            {
                // Step 2: Delete the date (cascade will remove galleries)
                await _datesRepository.DeleteAsync(date.DateId);

                // Step 3: Delete files after successful DB deletion
                foreach (var path in imagePaths)
                {
                    try
                    {
                        if (File.Exists(path))
                        {
                            File.Delete(path);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error deleting image file at {path}");
                    }
                }

                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting date with ID {dateId}");
                return ServiceResult<bool>.Failure($"An error occurred while deleting the date: {ex.Message}");
            }
        }


        #region Mappers
        private DateViewModel MapToDateDto(Date date)
        {
            return new DateViewModel
            {
                Id = date.DateId,
                CollectionId = date.CollectionId,
                CollectionName = date.Collection != null ? date.Collection.NameEn : string.Empty,
                NameEn = date.NameEn,
                NameSv = date.NameSv,
                IsActive = date.IsActive,
                UnitPrice = date.UnitPrice,
                WeightPrice = date.WeightPrice,
                CreatedAt = date.CreatedAt
            };
        }

        private DatesCollectionViewModel MapToDatesCollectionDto(DatesCollection collection)
        {
            return new DatesCollectionViewModel
            {
                Id = collection.CollectionId,
                NameEn = collection.NameEn,
                NameSv = collection.NameSv,
                ImageUrl = collection.ImageUrl,
                DescriptionEn = collection.DescriptionEn,
                DescriptionSv = collection.DescriptionSv,
                IsActive = collection.IsActive,
                CanDelete = !_datesRepository.ExistsByCollectionIdAsync(collection.CollectionId).Result,
                CreatedAt = collection.CreatedAt
            };
        }
        #endregion Mappers
    }
}