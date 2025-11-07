using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Collections
{
    public interface IProductCollectionRepository : IRepository<ProductCollection>
    {
        Task<List<ProductCollection>> GetByProductIdAsync(int productId);
    }
}