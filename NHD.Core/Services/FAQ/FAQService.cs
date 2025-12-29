using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.FAQ;
using NHD.Core.Repository.Lookup;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.FAQ;

namespace NHD.Core.Services.FAQ
{
    public class FAQService : IFAQService
    {
        private readonly IFAQRepository _faqRepository;
        private readonly ILookupRepository _lookupRepository;

        private readonly ILogger<FAQService> _logger;

        public FAQService(IFAQRepository faqRepository, ILookupRepository lookupRepository, ILogger<FAQService> logger)
        {
            _faqRepository = faqRepository;
            _lookupRepository = lookupRepository;
            _logger = logger;
        }
        public async Task<PagedServiceResult<IEnumerable<FAQViewModel>>> GetFaqsAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<FAQViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _faqRepository.GetFAQAsync(page, limit);
                var faqDtos = pagedResult.Data.Select(MapToFAQ).ToList();
                return PagedServiceResult<IEnumerable<FAQViewModel>>.Success(
                    faqDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving FAQs");
                return PagedServiceResult<IEnumerable<FAQViewModel>>.Failure("An error occurred while retrieving FAQs");
            }
        }

        public async Task<ServiceResult<IEnumerable<FAQViewModel>>> GetFAQsByTypeAsync(int type)
        {
            try
            {
                if (type <= 0)
                {
                    throw new ArgumentException("Type must be greater than 0", nameof(type));
                }
                var faqs = await _faqRepository.GetFAQsByTypeAsync(type);
                var faqDtos = faqs.Select(MapToFAQ);
                return ServiceResult<IEnumerable<FAQViewModel>>.Success(faqDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetFAQsByTypeAsync due to invalid type");
                return ServiceResult<IEnumerable<FAQViewModel>>.Failure("An error occurred while retrieving FAQs by type");
            }
        }

        public async Task<ServiceResult<FAQViewModel>> GetFAQViewModelByIdAsync(int id)
        {
            try
            {
                var faq = await _faqRepository.GetFAQByIdAsync(id);
                if (faq == null)
                {
                    return ServiceResult<FAQViewModel>.Failure($"FAQ with ID {id} not found.");
                }

                var faqDto = MapToFAQ(faq);
                return ServiceResult<FAQViewModel>.Success(faqDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving FAQ with ID {id}");
                return ServiceResult<FAQViewModel>.Failure("An error occurred while retrieving the FAQ");
            }
        }

        public async Task<Faq> GetFAQByIdAsync(int id)
        {
            return await _faqRepository.GetByIdAsync(id);
        }
        public async Task<Faq> AddFaq(Faq faq)
        {
            await _faqRepository.AddAsync(faq);
            return faq;
        }

        public async Task<Faq> UpdateFaqAsync(Faq faq)
        {
            await _faqRepository.UpdateAsync(faq);
            return faq;
        }

        public async Task<ServiceResult<bool>> DeleteFaqAsync(int faqId)
        {
            var faq = await _faqRepository.GetByIdAsync(faqId);
            if (faq == null)
            {
                return ServiceResult<bool>.Failure($"FAQ with ID {faqId} not found.");
            }

            try
            {
                await _faqRepository.DeleteAsync(faqId);
                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting FAQ with ID {faqId}");
                return ServiceResult<bool>.Failure($"An error occurred while deleting the FAQ: {ex.Message}");
            }
        }

        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetFaqTypesAsync()
        {
            try
            {
                var types = await _lookupRepository.GetFaqTypesAsync();
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
                _logger.LogError(ex, "Error retrieving FAQ types");
                return ServiceResult<IEnumerable<LookupItemDto>>.Failure("An error occurred while retrieving FAQ types");
            }
        }

        private FAQViewModel MapToFAQ(Faq faq)
        {
            return new FAQViewModel
            {
                Id = faq.FaqId,
                QuestionEn = faq.QuestionEn,
                QuestionSv = faq.QuestionSv,
                AnswerEn = faq.AnswerEn,
                AnswerSv = faq.AnswerSv,
                Type = faq.TypeLookup.NameEn,
                TypeId = faq.TypeLookupId,
                CreatedAt = faq.CreatedAt,
                IsActive = faq.IsActive
            };
        }
    }
}