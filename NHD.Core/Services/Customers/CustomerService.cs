using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Customers;
using NHD.Core.Services.Model.Customer;
using NHD.Core.Utilities;

namespace NHD.Core.Services.Customers
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(ICustomerRepository customerRepository, ILogger<CustomerService> logger)
        {
            _customerRepository = customerRepository;
            _logger = logger;
        }

        public async Task<ServiceResult<Customer>> AddCustomerAsync(Customer customer)
        {
            try
            {
                var customerExists = await _customerRepository.GetByEmailAsync(customer.EmailAddress);
                if (customerExists != null)
                    return ServiceResult<Customer>.Failure("Customer already exists");

                await _customerRepository.AddAsync(customer);
                var createdCustomer = await _customerRepository.GetByEmailAsync(customer.EmailAddress);
                return ServiceResult<Customer>.Success(createdCustomer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding customer");
                return ServiceResult<Customer>.Failure("An error occurred while adding the customer.");
            }
        }

        private CustomerRegistrationModel MapToCustomerBindingModel(Customer customer)
        {
            return new CustomerRegistrationModel
            {
                Id = customer.CustomerId,
                Email = customer.EmailAddress,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                PhoneNumber = customer.Mobile,
                //Provider = customer.Provider,
                //ProviderId = customer.ProviderId
            };
        }
    }
}