using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model.Customer;

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

        Task<Address> AddAddressAsync(Address address);
        Task<Address> UpdateAddressAsync(Address address);
        Task<Address> GetAddressAsync(int addressId);

        Task<Address?> SaveAddressAsync(int customerId, Address address);
        Task<ServiceResult<bool>> SetAddressAsDefaultAsync(int customerId, int addressId, int addressTypeId);
        Task<ServiceResult<bool>> DeleteAddressAsync(int addressId);
        Task<ServiceResult<bool>> ResendVerificationEmail(string email);
        Task<AppApiResponse<Customer>> LoginWithAppleAsync(AppleLoginModel appleLogin);
        Task<AppApiResponse<Customer>> LoginWithGoogleAsync(GoogleLoginModel googleLogin);
        Task<PagedServiceResult<IEnumerable<CustomerViewModel>>> GetCustomersAsync(int page = 1, int limit = 10);
        Task<ServiceResult<Customer>> UpdateCustomerStatusAsync(int customerId, int statusId);
        Task<PagedServiceResult<IEnumerable<AddressViewModel>>> GetAddressesByCustomerId(int customerId, int page = 1, int limit = 10);
        Task<ServiceResult<int>> PlaceOrderAsGuest(GuestCheckoutModel guestCheckout);
    }
}