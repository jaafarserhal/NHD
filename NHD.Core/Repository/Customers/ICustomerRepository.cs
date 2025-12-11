using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Customers
{
    public interface ICustomerRepository : IRepository<Customer>
    {
        Task<Customer> GetByEmailAsync(string email);
        Task<Customer> GetByVerificationTokenAsync(string token);
        Task<Customer> GetByUsernameAsync(string username);
    }
}