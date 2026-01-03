using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Dates
{
    public interface IDatesAdditionalInfoRepository : IRepository<DatesAdditionalInfo>
    {
        Task<IEnumerable<DatesAdditionalInfo>> GetAdditionalInfoByDateIdAsync(int dateId);
    }
}