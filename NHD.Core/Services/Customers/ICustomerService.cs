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
        Task<ServiceResult<string>> RegisterAsync(Customer customer);
        Task<AppApiResponse<Customer>> LoginAsync(string email, string password);
        Task<Customer> GetCustomerByVerificationTokenAsync(string token);
        Task<Customer> UpdateCustomerAsync(Customer customer);
        Task<AppApiResponse<Customer>> GetCustomerByEmailAsync(string email);

        Task<Customer> GetCustomerInfoByEmailAsync(string email);

        Task<ServiceResult<string>> ChangePasswordAsync(Customer customer);
        Task<ServiceResult<string>> InitiatePasswordResetAsync(string email);
    }
}