using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;

namespace NHD.Core.Services.Customers
{
    public interface ICustomerService
    {
        Task<ServiceResult<string>> RegisterCustomerAsync(Customer customer);
        Task<Customer> GetCustomerByVerificationTokenAsync(string token);
        Task<Customer> UpdateCustomerAsync(Customer customer);
    }
}