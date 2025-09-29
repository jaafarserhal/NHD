using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.DateProducts
{
    public interface IDateProductsRepository : IRepository<DatesProduct>
    {
        Task<List<DatesProduct>> GetByProductIdAsync(int productId);
    }
}