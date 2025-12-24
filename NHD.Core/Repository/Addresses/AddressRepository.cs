using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
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

        public async Task<IEnumerable<Address>> GetAddressesByCustomerIdAsync(int customerId)
        {
            return await _context.Addresses
                .Where(a => a.CustomerId == customerId)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}