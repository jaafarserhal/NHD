using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Addresses
{
    public interface IAddressRepository : IRepository<Address>
    {
        Task<IEnumerable<Address>> GetAddressesByCustomerIdAsync(int customerId);
        Task<PagedResult<Address>> GetAddressByCustomerId(int customerId, int page, int limit);
    }
}