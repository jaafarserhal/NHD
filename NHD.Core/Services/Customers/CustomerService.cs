using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Addresses;
using NHD.Core.Repository.Customers;
using NHD.Core.Services.Model.Customer;
using NHD.Core.Utilities;
using Org.BouncyCastle.Asn1.Misc;

namespace NHD.Core.Services.Customers
{
    public class CustomerService : ICustomerService
    {
        protected internal AppDbContext context;
        private readonly ICustomerRepository _customerRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<CustomerService> _logger;
        protected internal IDbContextTransaction Transaction;

        public CustomerService(AppDbContext context, ICustomerRepository customerRepository, IAddressRepository addressRepository, IEmailService emailService, ILogger<CustomerService> logger)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
            _customerRepository = customerRepository ?? throw new ArgumentNullException(nameof(customerRepository));
            _addressRepository = addressRepository ?? throw new ArgumentNullException(nameof(addressRepository));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Addresses

        public async Task<PagedServiceResult<IEnumerable<AddressViewModel>>> GetAddressesByCustomerId(int customerId, int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<AddressViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _addressRepository.GetAddressByCustomerId(customerId, page, limit);
                var addressDtos = pagedResult.Data.Select(c => new AddressViewModel
                {
                    Id = c.AddressId,
                    FullName = c.ContactFirstName + " " + c.ContactLastName,
                    Phone = c.ContactPhone,
                    StreetName = c.StreetName,
                    StreetNumber = c.StreetNumber,
                    PostalCode = c.PostalCode,
                    City = c.City,
                    IsPrimary = c.IsPrimary,
                    Type = c.AddressTypeLookup?.NameEn,
                    CreatedAt = c.CreatedAt
                }).ToList();
                return PagedServiceResult<IEnumerable<AddressViewModel>>.Success(
                    addressDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving addresses for customer");
                return PagedServiceResult<IEnumerable<AddressViewModel>>.Failure("An error occurred while retrieving addresses for customer");
            }
        }
        public async Task<Address?> SaveAddressAsync(int customerId, Address address)
        {
            await BeginTransactionAsync();

            try
            {
                // UPDATE
                if (address.AddressId > 0)
                {
                    // Try to get already-tracked entity first
                    var tracked = context.Addresses.Local
                        .FirstOrDefault(a => a.AddressId == address.AddressId);

                    Address existing;

                    if (tracked != null)
                    {
                        existing = tracked;
                    }
                    else
                    {
                        // Load from DB without tracking graph duplication
                        existing = await context.Addresses
                            .FirstOrDefaultAsync(a => a.AddressId == address.AddressId);

                        if (existing == null)
                            throw new InvalidOperationException("Address not found");

                        context.Attach(existing);
                    }

                    // Copy values to the tracked entity
                    context.Entry(existing).CurrentValues.SetValues(address);
                }
                else
                {
                    // INSERT
                    address.CustomerId = customerId;

                    var existingSameType = await context.Addresses
                        .AsNoTracking()
                        .AnyAsync(a =>
                            a.CustomerId == customerId &&
                            a.AddressTypeLookupId == address.AddressTypeLookupId);

                    // Set as primary if none exists for that type
                    if (!existingSameType)
                    {
                        address.IsPrimary = true;
                    }

                    await context.Addresses.AddAsync(address);
                }

                await SaveChangesAsync();
                await CommitTransactionAsync();

                return address;
            }
            catch (Exception ex)
            {
                await RollbackTransactionAsync();
                _logger.LogError(ex, "Error saving address");
                return null;
            }
        }

        public async Task<ServiceResult<bool>> SetAddressAsDefaultAsync(
            int customerId,
            int addressId,
            int addressTypeId)
        {
            await BeginTransactionAsync();

            try
            {
                // Load TRACKED entities (no AsNoTracking here)
                var addresses = await context.Addresses
                    .Where(a => a.CustomerId == customerId &&
                                a.AddressTypeLookupId == addressTypeId)
                    .ToListAsync();

                if (!addresses.Any())
                    return ServiceResult<bool>.Failure("No addresses found for this type.");

                foreach (var addr in addresses)
                {
                    addr.IsPrimary = addr.AddressId == addressId;
                }

                // No Update() needed because entities are tracked
                await SaveChangesAsync();
                await CommitTransactionAsync();

                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await RollbackTransactionAsync();
                _logger.LogError(ex, "Error setting address as default");
                return ServiceResult<bool>.Failure("An error occurred while setting the default address.");
            }
        }


        public async Task<ServiceResult<bool>> DeleteAddressAsync(int addressId)
        {
            try
            {
                var address = await _addressRepository.GetByIdAsync(addressId);
                if (address == null)
                {
                    return ServiceResult<bool>.Validate("Address not found.");
                }

                await _addressRepository.DeleteAsync(address.AddressId);
                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting address");
                return ServiceResult<bool>.Failure("An error occurred while deleting the address.");
            }
        }


        public async Task<Address> AddAddressAsync(Address address)
        {
            await _addressRepository.AddAsync(address);
            return address;
        }

        public async Task<Address> UpdateAddressAsync(Address address)
        {
            await _addressRepository.UpdateAsync(address);
            return address;
        }

        public async Task<Address> GetAddressAsync(int addressId)
        {
            return await _addressRepository.GetByIdAsync(addressId);
        }
        #endregion Addresses

        #region Customers
        public async Task<PagedServiceResult<IEnumerable<CustomerViewModel>>> GetCustomersAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<CustomerViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _customerRepository.GetCustomersAsync(page, limit);
                var faqDtos = pagedResult.Data.Select(c => new CustomerViewModel
                {
                    Id = c.CustomerId,
                    Email = c.EmailAddress,
                    FullName = $"{c.FirstName} {c.LastName}",
                    CreatedAt = c.CreatedAt,
                    Mobile = c.Mobile,
                    Status = c.StatusLookup.NameEn,
                    StatusId = c.StatusLookupId
                }).ToList();
                return PagedServiceResult<IEnumerable<CustomerViewModel>>.Success(
                    faqDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customers");
                return PagedServiceResult<IEnumerable<CustomerViewModel>>.Failure("An error occurred while retrieving customers");
            }
        }
        public async Task<ServiceResult<string>> RegisterAsync(Customer customer)
        {
            await BeginTransactionAsync();
            try
            {
                // 1. Check existing
                var existing = await _customerRepository.GetByEmailAsync(customer.EmailAddress);
                if (existing != null)
                {
                    await RollbackTransactionAsync();
                    return ServiceResult<string>.Validate("A customer with this email address already exists.");
                }

                // 2. Create email verification token
                customer.EmailVerificationToken = Guid.NewGuid().ToString("N");
                customer.EmailVerificationTokenExpires = DateTime.UtcNow.AddHours(24);

                // 3. Add customer
                await context.Customers.AddAsync(customer);
                await SaveChangesAsync();

                // 4. Send email BEFORE committing
                var emailSent = await _emailService.SendVerificationEmailAsync(
                    customer.FirstName,
                    customer.EmailAddress,
                    customer.EmailVerificationToken);

                if (!emailSent)
                {
                    await RollbackTransactionAsync();
                    return ServiceResult<string>.Failure("Failed to send verification email. Please try again.");
                }

                // 5. Commit only if everything succeeded
                await CommitTransactionAsync();

                return ServiceResult<string>.Success("Customer registered successfully. Please verify your email.");
            }
            catch (Exception ex)
            {
                await RollbackTransactionAsync();
                _logger.LogError(ex, "Error adding customer");
                return ServiceResult<string>.Failure("An error occurred while adding the customer.");
            }
        }

        public async Task<ServiceResult<bool>> ResendVerificationEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return ServiceResult<bool>.Validate("Email address is required");

            var customer = await _customerRepository.GetByEmailAsync(email);
            if (customer == null)
                return ServiceResult<bool>.Validate("Customer not found");

            if (customer.IsActive == true)
                return ServiceResult<bool>.Validate("Email is already verified.");

            // Optional: regenerate token if expired
            if (customer.EmailVerificationTokenExpires < DateTime.UtcNow)
            {
                customer.EmailVerificationToken = Guid.NewGuid().ToString("N");
                customer.EmailVerificationTokenExpires = DateTime.UtcNow.AddHours(24);
                await _customerRepository.UpdateAsync(customer);
            }

            var emailSent = await _emailService.SendVerificationEmailAsync(
                customer.FirstName,
                customer.EmailAddress,
                customer.EmailVerificationToken);

            if (!emailSent)
                return ServiceResult<bool>.Failure("Failed to send verification email. Please try again.");

            return ServiceResult<bool>.Success(true);
        }

        public async Task<ServiceResult<string>> ChangePasswordAsync(Customer customer)
        {
            await BeginTransactionAsync();
            try
            {
                // Hash the new password
                customer.Password = CommonUtilities.HashPassword(customer.Password);
                context.Customers.Update(customer);
                await SaveChangesAsync();

                // Send email BEFORE committing
                var emailSent = await _emailService.SendSuccefullPasswordChangeEmailAsync(
                    customer.EmailAddress,
                    customer.FirstName);

                if (!emailSent)
                {
                    await RollbackTransactionAsync();
                    return ServiceResult<string>.Failure("Failed to send password change confirmation email. Please try again.");
                }

                // 5. Commit only if everything succeeded
                await CommitTransactionAsync();

                return ServiceResult<string>.Success("Customer password changed successfully.");
            }
            catch (Exception ex)
            {
                await RollbackTransactionAsync();
                _logger.LogError(ex, "Error changing customer password");
                return ServiceResult<string>.Failure("An error occurred while changing the customer password.");
            }
        }

        public async Task<ServiceResult<string>> InitiatePasswordResetAsync(string email)
        {
            await BeginTransactionAsync();
            try
            {
                var customer = await _customerRepository.GetByEmailAsync(email);
                if (customer == null)
                {
                    return ServiceResult<string>.Validate("No customer found with the provided email address.");
                }

                customer.EmailVerificationToken = Guid.NewGuid().ToString("N");
                // Token valid for 1 hour
                customer.EmailVerificationTokenExpires = DateTime.UtcNow.AddHours(1);

                context.Customers.Update(customer);
                await SaveChangesAsync();

                // Send password reset email
                var emailSent = await _emailService.SendResetLinkEmailAsync(
                    customer.EmailAddress,
                    customer.FirstName,
                    customer.EmailVerificationToken);

                if (!emailSent)
                {
                    return ServiceResult<string>.Failure("Failed to send password reset email. Please try again.");
                }
                // 5. Commit only if everything succeeded
                await CommitTransactionAsync();

                return ServiceResult<string>.Success("Password reset email sent successfully.");
            }
            catch (Exception ex)
            {
                await RollbackTransactionAsync();
                _logger.LogError(ex, "Error initiating password reset");
                return ServiceResult<string>.Failure("An error occurred while initiating the password reset.");
            }
        }

        public async Task<AppApiResponse<Customer>> LoginAsync(string email, string password)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                {
                    return AppApiResponse<Customer>.Failure("Email and password cannot be empty", HttpStatusCodeEnum.BadRequest);
                }

                var customer = await _customerRepository.AuthenticateLoginAsync(email);

                if (customer == null || customer.Password != CommonUtilities.HashPassword(password))
                {
                    return AppApiResponse<Customer>.Failure("Invalid email or password", HttpStatusCodeEnum.Unauthorized);
                }
                else if (customer.StatusLookupId == CustomerStatusLookup.Pending.AsInt())
                {
                    return AppApiResponse<Customer>.Failure("Email not verified. Please verify your email before logging in.", HttpStatusCodeEnum.Unauthorized);
                }
                else if (customer.StatusLookupId == CustomerStatusLookup.InActive.AsInt())
                {
                    return AppApiResponse<Customer>.Failure("Your account is deactivated. Please contact support.", HttpStatusCodeEnum.Unauthorized);
                }

                return AppApiResponse<Customer>.Success(customer, "Login successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return AppApiResponse<Customer>.Failure("User login failed");
            }
        }

        public async Task<AppApiResponse<Customer>> LoginWithAppleAsync(AppleLoginModel appleLogin)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(appleLogin.IdentityToken) || string.IsNullOrWhiteSpace(appleLogin.Email))
                {
                    return AppApiResponse<Customer>.Failure("Apple identity token and email are required", HttpStatusCodeEnum.BadRequest);
                }

                // Try to find existing customer by Provider ID or email
                var existingCustomer = await _customerRepository.GetByEmailAsync(appleLogin.Email);

                if (existingCustomer != null)
                {
                    // Customer exists - update Provider ID if not set and log them in
                    if (string.IsNullOrEmpty(existingCustomer.ProviderId))
                    {
                        existingCustomer.ProviderId = appleLogin.ProviderId;
                        await _customerRepository.UpdateAsync(existingCustomer);
                    }

                    if (existingCustomer.StatusLookupId == CustomerStatusLookup.Pending.AsInt())
                    {
                        // Auto-verify Apple users since Apple has already verified their email
                        existingCustomer.StatusLookupId = CustomerStatusLookup.Active.AsInt();
                        existingCustomer.EmailVerificationToken = null;
                        await _customerRepository.UpdateAsync(existingCustomer);
                    }
                    else if (existingCustomer.StatusLookupId == CustomerStatusLookup.InActive.AsInt())
                    {
                        return AppApiResponse<Customer>.Failure("Your account is deactivated. Please contact support.", HttpStatusCodeEnum.Unauthorized);
                    }

                    return AppApiResponse<Customer>.Success(existingCustomer, "Apple login successful");
                }
                else
                {
                    // New customer - create account
                    var newCustomer = new Customer
                    {
                        EmailAddress = appleLogin.Email,
                        FirstName = appleLogin.FirstName ?? "Apple",
                        LastName = appleLogin.LastName ?? "User",
                        ProviderId = appleLogin.ProviderId,
                        StatusLookupId = CustomerStatusLookup.Active.AsInt(), // Auto-verify Apple users
                        Password = CommonUtilities.HashPassword(Guid.NewGuid().ToString()), // Random password since they use Apple
                        CreatedAt = DateTime.UtcNow
                    };

                    await _customerRepository.AddAsync(newCustomer);
                    return AppApiResponse<Customer>.Success(newCustomer, "Apple account created and logged in successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Apple login");
                return AppApiResponse<Customer>.Failure("Apple login failed");
            }
        }

        public async Task<AppApiResponse<Customer>> LoginWithGoogleAsync(GoogleLoginModel googleLogin)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(googleLogin.IdToken) || string.IsNullOrWhiteSpace(googleLogin.Email))
                {
                    return AppApiResponse<Customer>.Failure("Google identity token and email are required", HttpStatusCodeEnum.BadRequest);
                }

                // Try to find existing customer by Provider ID or email
                var existingCustomer = await _customerRepository.GetByEmailAsync(googleLogin.Email);

                if (existingCustomer != null)
                {
                    // Customer exists - update Provider ID if not set and log them in
                    if (string.IsNullOrEmpty(existingCustomer.ProviderId))
                    {
                        existingCustomer.ProviderId = googleLogin.ProviderId;
                        await _customerRepository.UpdateAsync(existingCustomer);
                    }

                    if (existingCustomer.StatusLookupId == CustomerStatusLookup.Pending.AsInt())
                    {
                        // Auto-verify Google users since Google has already verified their email
                        existingCustomer.StatusLookupId = CustomerStatusLookup.Active.AsInt();
                        existingCustomer.EmailVerificationToken = null;
                        await _customerRepository.UpdateAsync(existingCustomer);
                    }
                    else if (existingCustomer.StatusLookupId == CustomerStatusLookup.InActive.AsInt())
                    {
                        return AppApiResponse<Customer>.Failure("Your account is deactivated. Please contact support.", HttpStatusCodeEnum.Unauthorized);
                    }

                    return AppApiResponse<Customer>.Success(existingCustomer, "Google login successful");
                }
                else
                {
                    // New customer - create account
                    var newCustomer = new Customer
                    {
                        EmailAddress = googleLogin.Email,
                        FirstName = googleLogin.FirstName ?? "Google",
                        LastName = googleLogin.LastName ?? "User",
                        ProviderId = googleLogin.ProviderId,
                        StatusLookupId = CustomerStatusLookup.Active.AsInt(), // Auto-verify Google users
                        Password = CommonUtilities.HashPassword(Guid.NewGuid().ToString()), // Random password since they use Google
                        CreatedAt = DateTime.UtcNow
                    };

                    await _customerRepository.AddAsync(newCustomer);
                    return AppApiResponse<Customer>.Success(newCustomer, "Google account created and logged in successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Google login");
                return AppApiResponse<Customer>.Failure("Google login failed");
            }
        }

        public async Task<AppApiResponse<Customer>> GetCustomerByEmailAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                {
                    return AppApiResponse<Customer>.Failure("Email cannot be empty", HttpStatusCodeEnum.BadRequest);
                }

                var customer = await _customerRepository.GetByEmailAsync(email);

                if (customer == null)
                {
                    return AppApiResponse<Customer>.Failure("Customer not found", HttpStatusCodeEnum.NotFound);
                }

                return AppApiResponse<Customer>.Success(customer, "Customer retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customer by email");
                return AppApiResponse<Customer>.Failure("Failed to retrieve customer");
            }
        }

        public async Task<Customer> GetCustomerByVerificationTokenAsync(string token)
        {
            return await _customerRepository.GetByVerificationTokenAsync(token);
        }

        public async Task<Customer> GetCustomerInfoByEmailAsync(string email)
        {
            return await _customerRepository.GetByEmailAsync(email);
        }

        public async Task<Customer> UpdateCustomerAsync(Customer customer)
        {
            await _customerRepository.UpdateAsync(customer);
            return customer;
        }

        public async Task<ServiceResult<Customer>> UpdateCustomerStatusAsync(int customerId, int statusId)
        {
            try
            {
                var customer = await _customerRepository.GetByIdAsync(customerId);
                if (customer == null)
                {
                    return ServiceResult<Customer>.Failure("Customer not found");
                }

                customer.StatusLookupId = statusId;
                await _customerRepository.UpdateAsync(customer);

                return ServiceResult<Customer>.Success(customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer status");
                return ServiceResult<Customer>.Failure("Failed to update customer status");
            }
        }

        #endregion Customers

        #region Transactions
        public async Task BeginTransactionAsync()
        {
            if (Transaction == null && !context.InMemoryDatabase)
            {
                Transaction = await context.Database.BeginTransactionAsync();
            }
        }

        public async Task CommitTransactionAsync()
        {
            if (Transaction != null)
            {
                await Transaction.CommitAsync();
            }

            Transaction?.Dispose();
            Transaction = null;
        }

        public async Task RollbackTransactionAsync()
        {
            if (Transaction != null)
            {
                await Transaction.RollbackAsync();
            }
        }

        public Task<int> SaveChangesAsync()
        {
            return context.SaveChangesAsync();
        }

        #endregion Transactions
    }
}