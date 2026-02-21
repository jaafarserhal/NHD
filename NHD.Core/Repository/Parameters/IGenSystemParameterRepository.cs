using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Repository.Base;
using NHD.Core.Models;
using NHD.Core.Utilities;

namespace NHD.Core.Repository.Parameters
{
    public interface IGenSystemParameterRepository : IRepository<GenSystemParameter>
    {
        Task<List<GenSystemParameter>> GetActiveParametersAsync();
        Task<List<GenSystemParameter>> GetParametersByActiveStatusAsync(bool isActive);
        Task<GenSystemParameter> GetParameterByIdAsync(SystemParameterLookup parameterId);
    }
}