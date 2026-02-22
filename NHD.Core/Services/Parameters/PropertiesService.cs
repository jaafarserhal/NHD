using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Parameters;
using NHD.Core.Services.Model.Properties;

namespace NHD.Core.Services.Parameters
{
    public class PropertiesService : IPropertiesService
    {
        private readonly IGenSystemParameterRepository _genSystemParameterRepository;
        private readonly ILogger<PropertiesService> _logger;

        public PropertiesService(IGenSystemParameterRepository genSystemParameterRepository, ILogger<PropertiesService> logger)
        {
            _genSystemParameterRepository = genSystemParameterRepository;
            _logger = logger;
        }

        public async Task<PagedServiceResult<IEnumerable<PropertiesViewModel>>> GetPropertiesAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<PropertiesViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _genSystemParameterRepository.GetParameters(page, limit);
                var parameterDtos = pagedResult.Data.Select(MapToParameter).ToList();

                return PagedServiceResult<IEnumerable<PropertiesViewModel>>.Success(
                    parameterDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving properties");
                return PagedServiceResult<IEnumerable<PropertiesViewModel>>.Failure("An error occurred while retrieving properties");
            }
        }


        public async Task<ServiceResult<PropertiesViewModel>> GetPropertyByIdAsync(int id)
        {
            try
            {
                var parameter = await _genSystemParameterRepository.GetByIdAsync(id);
                if (parameter == null)
                {
                    return ServiceResult<PropertiesViewModel>.Failure("Property not found");
                }

                var parameterDto = MapToParameter(parameter);
                return ServiceResult<PropertiesViewModel>.Success(parameterDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving property with ID {id}");
                return ServiceResult<PropertiesViewModel>.Failure("An error occurred while retrieving the property");
            }
        }

        public async Task<GenSystemParameter> UpdatePropertyAsync(GenSystemParameter property)
        {
            await _genSystemParameterRepository.UpdateAsync(property);
            return property;
        }

        private PropertiesViewModel MapToParameter(GenSystemParameter parameter)
        {
            return new PropertiesViewModel
            {
                Id = parameter.SystemParameterId,
                Title = parameter.Title,
                ValueEn = parameter.ValueEn,
                ValueSv = parameter.ValueSv,
                IsActive = parameter.IsActive,
                CreatedAt = parameter.CreatedAt
            };
        }
    }
}