using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Lookup;
using NHD.Core.Repository.Sections;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Sections;

namespace NHD.Core.Services.Sections
{
    public class SectionService : ISectionService
    {
        private readonly ISectionRepository _sectionRepository;
        private readonly ILogger<SectionService> _logger;
        private readonly ILookupRepository _lookupRepository;

        public SectionService(ISectionRepository sectionRepository, ILogger<SectionService> logger, ILookupRepository lookupRepository)
        {
            _sectionRepository = sectionRepository;
            _logger = logger;
            _lookupRepository = lookupRepository;
        }

        public async Task<ServiceResult<IEnumerable<SectionViewModel>>> GetHomeSliderSectionsAsync(int take)
        {
            var sections = await _sectionRepository.GetHomeSliderSectionAsync(take);
            var sectionDtos = sections.Select(MapToSection).ToList();
            return ServiceResult<IEnumerable<SectionViewModel>>.Success(sectionDtos);
        }

        public async Task<PagedServiceResult<IEnumerable<SectionViewModel>>> GetSectionsAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<SectionViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _sectionRepository.GetSectionsAsync(page, limit);
                var sectionDtos = pagedResult.Data.Select(MapToSection).ToList();

                return PagedServiceResult<IEnumerable<SectionViewModel>>.Success(
                    sectionDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sections");
                return PagedServiceResult<IEnumerable<SectionViewModel>>.Failure("An error occurred while retrieving sections");
            }
        }

        public async Task<ServiceResult<SectionViewModel>> GetViewModelSectionByIdAsync(int id)
        {
            try
            {
                var section = await _sectionRepository.GetSectionByIdAsync(id);
                if (section == null)
                {
                    return ServiceResult<SectionViewModel>.Failure($"Section with ID {id} not found.");
                }

                var sectionDto = MapToSection(section);
                return ServiceResult<SectionViewModel>.Success(sectionDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving section with ID {id}");
                return ServiceResult<SectionViewModel>.Failure("An error occurred while retrieving the section");
            }
        }

        public async Task<Section> GetSectionByIdAsync(int id)
        {
            return await _sectionRepository.GetByIdAsync(id);
        }

        public async Task<Section> AddSectionAsync(Section section)
        {
            await _sectionRepository.AddAsync(section);
            return section;
        }

        public async Task<Section> UpdateSectionAsync(Section section)
        {
            await _sectionRepository.UpdateAsync(section);
            return section;
        }

        public async Task<ServiceResult<bool>> DeleteSectionAsync(int sectionId)
        {
            var section = await _sectionRepository.GetByIdAsync(sectionId);
            if (section == null)
            {
                return ServiceResult<bool>.Failure($"Section with ID {sectionId} not found.");
            }

            try
            {
                await _sectionRepository.DeleteAsync(sectionId);
                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting section with ID {sectionId}");
                return ServiceResult<bool>.Failure($"An error occurred while deleting the section: {ex.Message}");
            }
        }

        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetTypesAsync()
        {
            try
            {
                var types = await _lookupRepository.GetSectionTypesAsync();
                var typeDtos = types.Select(t => new LookupItemDto
                {
                    Id = t.LookupId,
                    NameEn = t.NameEn,
                    NameSv = t.NameSv
                });
                return ServiceResult<IEnumerable<LookupItemDto>>.Success(typeDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving section types");
                return ServiceResult<IEnumerable<LookupItemDto>>.Failure("An error occurred while retrieving section types");
            }
        }

        #region Private Methods
        private SectionViewModel MapToSection(Section section)
        {
            return new SectionViewModel
            {
                Id = section.SectionId,
                TitleEn = section.TitleEn,
                TitleSv = section.TitleSv,
                DescriptionEn = section.DescriptionEn,
                DescriptionSv = section.DescriptionSv,
                ImageUrl = section.ImageUrl,
                TypeId = section.TypeLookupId.HasValue ? section.TypeLookupId.Value : 0,
                TypeName = section.TypeLookupId.HasValue ? section.TypeLookup.NameEn : string.Empty,
                IsActive = section.IsActive ?? false,
                CreatedAt = section.CreatedAt
            };
        }
        #endregion

    }
}