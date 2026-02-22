using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model.Properties;

namespace NHD.Core.Services.Parameters
{
    public interface IPropertiesService
    {
        Task<PagedServiceResult<IEnumerable<PropertiesViewModel>>> GetPropertiesAsync(int page = 1, int limit = 10);
        Task<ServiceResult<PropertiesViewModel>> GetPropertyByIdAsync(int id);
        Task<GenSystemParameter> UpdatePropertyAsync(GenSystemParameter property);
    }
}