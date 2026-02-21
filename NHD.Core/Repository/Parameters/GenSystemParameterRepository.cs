using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Repository.Base;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Utilities;

namespace NHD.Core.Repository.Parameters
{
    public class GenSystemParameterRepository : Repository<GenSystemParameter>, IGenSystemParameterRepository
    {
        public GenSystemParameterRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<List<GenSystemParameter>> GetActiveParametersAsync()
        {
            return await _context.GenSystemParameters
                                     .Where(p => p.IsActive)
                                     .ToListAsync();
        }

        public async Task<GenSystemParameter> GetParameterByIdAsync(SystemParameterLookup parameterId)
        {
            return await _context.GenSystemParameters
                                     .FirstOrDefaultAsync(p => p.SystemParameterId == parameterId.AsInt());
        }


        public async Task<List<GenSystemParameter>> GetParametersByActiveStatusAsync(bool isActive)
        {
            return await _context.GenSystemParameters
                                     .Where(p => p.IsActive == isActive)
                                     .ToListAsync();
        }
    }
}