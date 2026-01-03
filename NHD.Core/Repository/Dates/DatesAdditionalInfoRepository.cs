using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Dates
{
    public class DatesAdditionalInfoRepository : Repository<DatesAdditionalInfo>, IDatesAdditionalInfoRepository
    {
        public DatesAdditionalInfoRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<DatesAdditionalInfo>> GetAdditionalInfoByDateIdAsync(int dateId)
        {
            return await _context.DatesAdditionalInfos
                .Where(d => d.DateId == dateId)
                .ToListAsync();
        }
    }
}