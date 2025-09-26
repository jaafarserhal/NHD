using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.DatesFilling
{
    public class DatesFillingRepository : Repository<DatesGourmetFilling>, IDatesFillingRepository
    {
        public DatesFillingRepository(AppDbContext context) : base(context)
        {
        }
    }
}