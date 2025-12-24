using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;
using NHD.Core.Utilities;

namespace NHD.Core.Repository.Customers
{
    public class CustomerRepository : Repository<Customer>, ICustomerRepository
    {
        public CustomerRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Customer> GetByEmailAsync(string email)
        {
            return await Task.FromResult(_context.Customers
            .Include(c => c.Addresses)
            .ThenInclude(t => t.AddressTypeLookup)
            .FirstOrDefault(c => c.EmailAddress == email));
        }

        public async Task<Customer> GetByVerificationTokenAsync(string token)
        {
            return await _context.Customers
                .FirstOrDefaultAsync(x => x.EmailVerificationToken == token);
        }

        public async Task<Customer> AuthenticateLoginAsync(string username)
        {
            return await Task.FromResult(_context.Customers.FirstOrDefault(c => c.EmailAddress == username && c.IsActive == true && c.StatusLookupId == CustomerStatusLookup.Active.AsInt()));
        }
    }
}