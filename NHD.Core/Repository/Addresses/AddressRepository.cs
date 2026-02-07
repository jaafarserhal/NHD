using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Addresses
{
    public class AddressRepository : Repository<Address>, IAddressRepository
    {
        public AddressRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<Address>> GetAddressByCustomerId(int customerId, int page, int limit)
        {
            var query = _context.Addresses
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();

            var addresses = await query
                .Where(a => a.CustomerId == customerId)
                .Include(a => a.AddressTypeLookup)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<Address>
            {
                Data = addresses,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<IEnumerable<Address>> GetAddressesByCustomerIdAsync(int customerId)
        {
            return await _context.Addresses
                .Where(a => a.CustomerId == customerId && a.IsActive == true)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}