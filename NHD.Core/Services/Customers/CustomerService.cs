using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using iText.Commons.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Addresses;
using NHD.Core.Repository.Customers;
using NHD.Core.Repository.Parameters;
using NHD.Core.Services.Model;
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
        private readonly IGenSystemParameterRepository _genSystemParameterRepository;
        private readonly IEmailService _emailService;
        private readonly IPdfReceiptService _pdfReceiptService;
        private readonly ILogger<CustomerService> _logger;
        protected internal IDbContextTransaction Transaction;

        public CustomerService(AppDbContext context, ICustomerRepository customerRepository, IAddressRepository addressRepository, IGenSystemParameterRepository genSystemParameterRepository, IEmailService emailService, IPdfReceiptService pdfReceiptService, ILogger<CustomerService> logger)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
            _customerRepository = customerRepository ?? throw new ArgumentNullException(nameof(customerRepository));
            _addressRepository = addressRepository ?? throw new ArgumentNullException(nameof(addressRepository));
            _genSystemParameterRepository = genSystemParameterRepository ?? throw new ArgumentNullException(nameof(genSystemParameterRepository));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _pdfReceiptService = pdfReceiptService ?? throw new ArgumentNullException(nameof(pdfReceiptService));
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

        public async Task<ServiceResult<IEnumerable<Address>>> GetCustomerAddressesAsync(int customerId)
        {
            try
            {
                var address = await _addressRepository.GetAddressesByCustomerIdAsync(customerId);
                if (address == null || !address.Any())
                {
                    return ServiceResult<IEnumerable<Address>>.Validate("Address not found for this customer.");
                }

                return ServiceResult<IEnumerable<Address>>.Success(address);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving address");
                return ServiceResult<IEnumerable<Address>>.Failure("An error occurred while retrieving the address.");
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

        public async Task<ServiceResult<PropertiesDto>> GetSystemPropertiesAsync()
        {
            try
            {
                var parameters = await _genSystemParameterRepository.GetActiveParametersAsync();

                var propertiesDto = new PropertiesDto
                {
                    ShippingCost = parameters.FirstOrDefault(p => p.SystemParameterId == SystemParameterLookup.ShippingCost.AsInt())?.ValueEn,
                    ShippingArrivalTime = parameters.FirstOrDefault(p => p.SystemParameterId == SystemParameterLookup.ShippingArrivalTime.AsInt())?.ValueEn
                };

                return ServiceResult<PropertiesDto>.Success(propertiesDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system properties");
                return ServiceResult<PropertiesDto>.Failure("An error occurred while retrieving system properties.");
            }
        }
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
                    // If account id deactivated, prevent login even if Google token is valid
                    if (existingCustomer.StatusLookupId == CustomerStatusLookup.InActive.AsInt())
                    {
                        return AppApiResponse<Customer>.Failure("Your account is deactivated. Please contact support.", HttpStatusCodeEnum.Unauthorized);
                    }
                    // Customer exists - update Provider ID if not set and log them in
                    else if (!string.IsNullOrEmpty(existingCustomer.ProviderId))
                    {
                        existingCustomer.ProviderId = googleLogin.ProviderId;
                        existingCustomer.FirstName = googleLogin.FirstName;
                        existingCustomer.LastName = googleLogin.LastName;
                        existingCustomer.IsGuest = false; // In case they are upgrading from guest to Google login
                        existingCustomer.StatusLookupId = CustomerStatusLookup.Active.AsInt(); // Auto-verify Google users
                        existingCustomer.EmailVerificationToken = null; // Clear any existing verification token
                        existingCustomer.EmailVerificationTokenExpires = null;
                        await _customerRepository.UpdateAsync(existingCustomer);
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
                        Password = null, // No password since they use Google
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

        #region Checkout

        public async Task<ServiceResult<int>> PlaceOrderAsGuest(GuestCheckoutModel guestCheckout)
        {
            try
            {
                // Validate input
                if (guestCheckout == null)
                    return ServiceResult<int>.Failure("Guest checkout model is required.");

                if (string.IsNullOrEmpty(guestCheckout.Email))
                    return ServiceResult<int>.Failure("Email is required.");

                if (guestCheckout.Items == null || !guestCheckout.Items.Any())
                    return ServiceResult<int>.Failure("At least one item is required.");

                if (guestCheckout.Shipping == null)
                    return ServiceResult<int>.Failure("Shipping address is required.");

                await BeginTransactionAsync();

                // Create or get guest customer
                var guestCustomer = await GetOrCreateGuestCustomerAsync(guestCheckout.Email);
                if (guestCustomer == null)
                {
                    await RollbackTransactionAsync();
                    return ServiceResult<int>.Failure("Failed to create guest customer.");
                }

                Address shippingAddress;
                Address billingAddress;

                // Handle addresses based on whether billing is same as shipping
                if (guestCheckout.IsBillingSameAsShipping)
                {
                    // Check if a "Both" address type already exists for this customer
                    var existingBothAddress = await context.Addresses
                        .FirstOrDefaultAsync(a =>
                            a.CustomerId == guestCustomer.CustomerId &&
                            a.AddressTypeLookupId == AddressType.Both.AsInt() &&
                            a.IsActive);

                    if (existingBothAddress != null)
                    {
                        // Update the existing "Both" address with new shipping info
                        existingBothAddress.ContactFirstName = guestCheckout.Shipping.FirstName;
                        existingBothAddress.ContactLastName = guestCheckout.Shipping.LastName;
                        existingBothAddress.ContactPhone = guestCheckout.Shipping.Phone;
                        existingBothAddress.StreetName = guestCheckout.Shipping.StreetName;
                        existingBothAddress.StreetNumber = guestCheckout.Shipping.StreetNumber;
                        existingBothAddress.PostalCode = guestCheckout.Shipping.PostalCode;
                        existingBothAddress.City = guestCheckout.Shipping.City;
                        existingBothAddress.CreatedAt = DateTime.UtcNow;

                        context.Addresses.Update(existingBothAddress);
                        await SaveChangesAsync();

                        shippingAddress = existingBothAddress;
                        billingAddress = existingBothAddress;
                    }
                    else
                    {
                        // Create new address with "Both" type
                        shippingAddress = await CreateAddressFromGuestModelAsync(
                            guestCustomer.CustomerId,
                            guestCheckout.Shipping,
                            AddressType.Both.AsInt());

                        billingAddress = shippingAddress;
                    }
                }
                else
                {
                    // Billing is different from shipping
                    if (guestCheckout.Billing == null)
                    {
                        await RollbackTransactionAsync();
                        return ServiceResult<int>.Failure("Billing address is required when different from shipping.");
                    }

                    // Create separate shipping and billing addresses
                    shippingAddress = await CreateAddressFromGuestModelAsync(
                        guestCustomer.CustomerId,
                        guestCheckout.Shipping,
                        AddressType.Shipping.AsInt());

                    billingAddress = await CreateAddressFromGuestModelAsync(
                        guestCustomer.CustomerId,
                        guestCheckout.Billing,
                        AddressType.Billing.AsInt());
                }

                // Validate product availability
                foreach (var item in guestCheckout.Items)
                {
                    var product = await context.Products
                        .FirstOrDefaultAsync(p => p.PrdId == item.ProductId);

                    if (product == null)
                    {
                        await RollbackTransactionAsync();
                        return ServiceResult<int>.Failure($"Product with ID {item.ProductId} not found.");
                    }

                    if (product.Quantity < item.Quantity)
                    {
                        await RollbackTransactionAsync();
                        return ServiceResult<int>.Failure(
                            $"Insufficient stock for product ID {item.ProductId}. " +
                            $"Available: {product.Quantity}, Requested: {item.Quantity}");
                    }
                }

                // Create order
                var order = new Order
                {
                    CustomerId = guestCustomer.CustomerId,
                    GuestEmail = guestCheckout.Email,
                    OrderDate = DateTime.UtcNow,
                    OrderStatusLookupId = OrderStatusLookup.Pending.AsInt(),
                    TotalAmount = guestCheckout.TotalPrice,
                    Note = guestCheckout.Note,
                    BillingAddressId = billingAddress.AddressId,
                    ShippingAddressId = shippingAddress.AddressId,
                    GeneratedOrderId = guestCheckout.GeneratedOrderId,
                    CreatedAt = DateTime.UtcNow
                };

                var createdOrder = context.Orders.Add(order);
                await SaveChangesAsync();

                // Update product quantities and create order items
                foreach (var item in guestCheckout.Items)
                {
                    var product = await context.Products
                        .FirstOrDefaultAsync(p => p.PrdId == item.ProductId);

                    product.Quantity -= item.Quantity;
                    context.Products.Update(product);

                    var orderItem = new OrderItem
                    {
                        OrderId = createdOrder.Entity.OrderId,
                        PrdId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = (decimal)item.Price,
                        CreatedAt = DateTime.UtcNow
                    };

                    context.OrderItems.Add(orderItem);
                }

                await SaveChangesAsync();
                await CommitTransactionAsync();

                _logger.LogInformation(
                    "Guest checkout created successfully. OrderId: {OrderId}, Email: {Email}",
                    createdOrder.Entity.OrderId,
                    guestCheckout.Email);

                // Send receipt email with PDF attachment
                try
                {
                    var orderItems = await context.OrderItems
                        .Where(oi => oi.OrderId == createdOrder.Entity.OrderId)
                        .ToListAsync();

                    var pdfData = await _pdfReceiptService.GenerateGuestReceiptPdfAsync(
                        createdOrder.Entity,
                        guestCustomer,
                        orderItems,
                        shippingAddress,
                        billingAddress);

                    var subject = $"Order Confirmation - Nawa #{createdOrder.Entity.GeneratedOrderId ?? createdOrder.Entity.OrderId.ToString()}";
                    var body = _emailService.GenerateReceiptEmailBody(guestCheckout.Email, createdOrder.Entity.GeneratedOrderId ?? createdOrder.Entity.OrderId.ToString());
                    var fileName = $"receipt_{createdOrder.Entity.GeneratedOrderId ?? createdOrder.Entity.OrderId.ToString()}.pdf";

                    await _emailService.SendEmailWithAttachmentAsync(
                        guestCheckout.Email,
                        subject,
                        body,
                        pdfData,
                        fileName);

                    _logger.LogInformation("Receipt email sent successfully to {Email} for order {OrderId}",
                        guestCheckout.Email, createdOrder.Entity.OrderId);
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Failed to send receipt email for order {OrderId} to {Email}",
                        createdOrder.Entity.OrderId, guestCheckout.Email);
                    // Don't fail the order if email sending fails
                }

                return ServiceResult<int>.Success(createdOrder.Entity.OrderId);
            }
            catch (Exception ex)
            {
                await RollbackTransactionAsync();
                _logger.LogError(ex, "Error placing guest order for email: {Email}", guestCheckout?.Email);
                return ServiceResult<int>.Failure("Failed to place order. Please try again.");
            }
        }

        private async Task<Customer> GetOrCreateGuestCustomerAsync(string email)
        {
            try
            {
                // Check if customer already exists
                var existingCustomer = await _customerRepository.GetByEmailAsync(email);
                if (existingCustomer != null)
                {
                    return existingCustomer;
                }

                // Create guest customer
                var guestCustomer = new Customer
                {
                    EmailAddress = email,
                    FirstName = "Guest",
                    LastName = "Customer",
                    Password = null,
                    StatusLookupId = (int)CustomerStatusLookup.Guest,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    EmailVerificationToken = null,
                    EmailVerificationTokenExpires = null,
                    IsGuest = true
                };

                context.Customers.Add(guestCustomer);
                await SaveChangesAsync();

                return guestCustomer;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating guest customer for email: {Email}", email);
                throw;
            }
        }

        private async Task<Address> CreateAddressFromGuestModelAsync(int customerId, OrderAddressModel addressModel, int addressTypeId)
        {
            try
            {
                // Get customer to check if they are a guest
                var customer = await context.Customers.FirstOrDefaultAsync(c => c.CustomerId == customerId);
                if (customer == null)
                {
                    throw new InvalidOperationException($"Customer with ID {customerId} not found.");
                }

                // Check if an address with the same type already exists for this customer
                var existingAddress = await context.Addresses
                    .FirstOrDefaultAsync(a => a.CustomerId == customerId &&
                                            a.AddressTypeLookupId == addressTypeId &&
                                            a.IsActive);

                if (existingAddress != null)
                {
                    // Update existing address
                    existingAddress.ContactFirstName = addressModel.FirstName ?? "Guest";
                    existingAddress.ContactLastName = addressModel.LastName ?? "Customer";
                    existingAddress.ContactPhone = addressModel.Phone;
                    existingAddress.StreetName = addressModel.StreetName;
                    existingAddress.StreetNumber = addressModel.StreetNumber;
                    existingAddress.PostalCode = addressModel.PostalCode;
                    existingAddress.City = addressModel.City;
                    existingAddress.CountryCode = "SE"; // Default to Sweden
                    existingAddress.CreatedAt = DateTime.UtcNow;

                    context.Addresses.Update(existingAddress);
                    await SaveChangesAsync();

                    _logger.LogInformation("Updated existing address for customer: {CustomerId}, AddressType: {AddressTypeId}", customerId, addressTypeId);
                    return existingAddress;
                }
                else
                {
                    // Create new address
                    var address = new Address
                    {
                        CustomerId = customerId,
                        ContactFirstName = addressModel.FirstName ?? "Guest",
                        ContactLastName = addressModel.LastName ?? "Customer",
                        ContactPhone = addressModel.Phone,
                        StreetName = addressModel.StreetName,
                        StreetNumber = addressModel.StreetNumber,
                        PostalCode = addressModel.PostalCode,
                        City = addressModel.City,
                        CountryCode = "SE", // Default to Sweden
                        AddressTypeLookupId = addressTypeId,
                        IsPrimary = true,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    context.Addresses.Add(address);
                    await SaveChangesAsync();

                    _logger.LogInformation("Created new address for customer: {CustomerId}, AddressType: {AddressTypeId}", customerId, addressTypeId);
                    return address;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating/updating address for customer: {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<ServiceResult<int>> PlaceOrderAsync(int customerId, CustomerCheckoutModel checkout)
        {
            var validationResult = ValidateCheckout(checkout);
            if (!validationResult.IsSuccess)
            {
                return ServiceResult<int>.Failure(validationResult.ErrorMessage);
            }

            await BeginTransactionAsync();

            try
            {
                var customer = await ValidateCustomerAsync(customerId);
                if (customer == null)
                {
                    return ServiceResult<int>.Failure("Customer not found.");
                }

                var shippingAddress = await GetOrCreateAddressAsync(
                    customerId,
                    checkout.Shipping,
                    AddressType.Shipping
                );

                var billingAddress = await ResolveBillingAddressAsync(
                    customerId,
                    checkout,
                    shippingAddress
                );

                var stockValidationResult = await ValidateAndUpdateStockAsync(checkout.Items);
                if (!stockValidationResult.IsSuccess)
                {
                    await RollbackTransactionAsync();
                    return ServiceResult<int>.Failure(stockValidationResult.ErrorMessage);
                }

                var order = await CreateOrderAsync(
                    customerId,
                    checkout,
                    shippingAddress.AddressId,
                    billingAddress.AddressId
                );

                await CreateOrderItemsAsync(order.OrderId, checkout.Items);
                await CommitTransactionAsync();

                _logger.LogInformation(
                    "Order placed successfully for customer: {CustomerId}, OrderId: {OrderId}",
                    customerId,
                    order.OrderId
                );

                // Send receipt email with PDF attachment
                try
                {
                    var customerInfo = await context.Customers
                        .FirstOrDefaultAsync(c => c.CustomerId == customerId);

                    if (customerInfo != null)
                    {
                        var orderItems = await context.OrderItems
                            .Where(oi => oi.OrderId == order.OrderId)
                            .ToListAsync();

                        var pdfData = await _pdfReceiptService.GenerateCustomerReceiptPdfAsync(
                            order,
                            customerInfo,
                            orderItems,
                            shippingAddress,
                            billingAddress);

                        var subject = $"Order Confirmation - Nawa #{order.GeneratedOrderId ?? order.OrderId.ToString()}";
                        var body = _emailService.GenerateReceiptEmailBody(customerInfo.EmailAddress, order.GeneratedOrderId ?? order.OrderId.ToString());
                        var fileName = $"receipt_{order.GeneratedOrderId ?? order.OrderId.ToString()}.pdf";

                        await _emailService.SendEmailWithAttachmentAsync(
                            customerInfo.EmailAddress,
                            subject,
                            body,
                            pdfData,
                            fileName);

                        _logger.LogInformation("Receipt email sent successfully to {Email} for order {OrderId}",
                            customerInfo.EmailAddress, order.OrderId);
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Failed to send receipt email for order {OrderId} to customer {CustomerId}",
                        order.OrderId, customerId);
                    // Don't fail the order if email sending fails
                }

                return ServiceResult<int>.Success(order.OrderId);
            }
            catch (Exception ex)
            {
                await RollbackTransactionAsync();
                _logger.LogError(ex, "Error placing order for customer: {CustomerId}", customerId);
                return ServiceResult<int>.Failure("Failed to place order. Please try again.");
            }
        }

        private ServiceResult<bool> ValidateCheckout(CustomerCheckoutModel checkout)
        {
            if (checkout == null)
            {
                return ServiceResult<bool>.Failure("Checkout model is required.");
            }

            if (checkout.Items == null || !checkout.Items.Any())
            {
                return ServiceResult<bool>.Failure("At least one item is required.");
            }

            return ServiceResult<bool>.Success(true);
        }

        private async Task<Customer> ValidateCustomerAsync(int customerId)
        {
            return await context.Customers.FirstOrDefaultAsync(c => c.CustomerId == customerId);
        }

        private async Task<Address> GetOrCreateAddressAsync(
            int customerId,
            OrderAddressModel addressModel,
            AddressType addressType)
        {
            if (addressModel.Id != 0)
            {
                var existingAddress = await context.Addresses
                    .FirstOrDefaultAsync(a =>
                        a.AddressId == addressModel.Id &&
                        a.CustomerId == customerId
                    );

                if (existingAddress == null)
                {
                    throw new InvalidOperationException($"{addressType} address not found.");
                }

                _logger.LogInformation(
                    "Using existing {AddressType} address for customer: {CustomerId}",
                    addressType,
                    customerId
                );

                return existingAddress;
            }

            var newAddress = new Address
            {
                CustomerId = customerId,
                ContactFirstName = addressModel.FirstName,
                ContactLastName = addressModel.LastName,
                ContactPhone = addressModel.Phone,
                StreetName = addressModel.StreetName,
                StreetNumber = addressModel.StreetNumber,
                PostalCode = addressModel.PostalCode,
                City = addressModel.City,
                CountryCode = "SE",
                AddressTypeLookupId = addressType.AsInt(),
                IsPrimary = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Addresses.Add(newAddress);
            await SaveChangesAsync();

            _logger.LogInformation(
                "Created new {AddressType} address for customer: {CustomerId}",
                addressType,
                customerId
            );

            return newAddress;
        }

        private async Task<Address> ResolveBillingAddressAsync(
            int customerId,
            CustomerCheckoutModel checkout,
            Address shippingAddress)
        {
            if (checkout.IsBillingSameAsShipping || checkout.Billing == null)
            {
                return await CreateBillingAddressFromShippingAsync(shippingAddress);
            }

            return await GetOrCreateAddressAsync(customerId, checkout.Billing, AddressType.Billing);
        }

        private async Task<Address> CreateBillingAddressFromShippingAsync(Address shippingAddress)
        {
            var existingBillingAddress = await context.Addresses
                .FirstOrDefaultAsync(a =>
                    a.CustomerId == shippingAddress.CustomerId &&
                    a.AddressTypeLookupId == AddressType.Billing.AsInt() &&
                    a.IsActive && a.IsPrimary);

            if (existingBillingAddress != null)
            {
                //update existing billing address to match shipping address
                existingBillingAddress.ContactFirstName = shippingAddress.ContactFirstName;
                existingBillingAddress.ContactLastName = shippingAddress.ContactLastName;
                existingBillingAddress.ContactPhone = shippingAddress.ContactPhone;
                existingBillingAddress.StreetName = shippingAddress.StreetName;
                existingBillingAddress.StreetNumber = shippingAddress.StreetNumber;
                existingBillingAddress.PostalCode = shippingAddress.PostalCode;
                existingBillingAddress.City = shippingAddress.City;
                existingBillingAddress.CountryCode = shippingAddress.CountryCode;
                existingBillingAddress.CreatedAt = DateTime.UtcNow;

                context.Addresses.Update(existingBillingAddress);
                await SaveChangesAsync();

                return existingBillingAddress;
            }
            else
            {
                var billingAddress = new Address
                {
                    CustomerId = shippingAddress.CustomerId,
                    ContactFirstName = shippingAddress.ContactFirstName,
                    ContactLastName = shippingAddress.ContactLastName,
                    ContactPhone = shippingAddress.ContactPhone,
                    StreetName = shippingAddress.StreetName,
                    StreetNumber = shippingAddress.StreetNumber,
                    PostalCode = shippingAddress.PostalCode,
                    City = shippingAddress.City,
                    CountryCode = shippingAddress.CountryCode,
                    AddressTypeLookupId = AddressType.Billing.AsInt(),
                    IsPrimary = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Addresses.Add(billingAddress);
                await SaveChangesAsync();

                return billingAddress;
            }
        }

        private async Task<ServiceResult<bool>> ValidateAndUpdateStockAsync(
            IEnumerable<OrderItemModel> items)
        {
            foreach (var item in items)
            {
                var product = await context.Products
                    .FirstOrDefaultAsync(p => p.PrdId == item.ProductId);

                if (product == null)
                {
                    return ServiceResult<bool>.Failure(
                        $"Product with ID {item.ProductId} not found."
                    );
                }

                if (product.Quantity < item.Quantity)
                {
                    return ServiceResult<bool>.Failure(
                        $"Insufficient stock for product ID {item.ProductId}. " +
                        $"Available: {product.Quantity}, Requested: {item.Quantity}"
                    );
                }

                product.Quantity -= item.Quantity;
                context.Products.Update(product);
            }

            await SaveChangesAsync();
            return ServiceResult<bool>.Success(true);
        }

        private async Task<Order> CreateOrderAsync(
            int customerId,
            CustomerCheckoutModel checkout,
            int shippingAddressId,
            int billingAddressId)
        {
            var order = new Order
            {
                CustomerId = customerId,
                OrderDate = DateTime.UtcNow,
                OrderStatusLookupId = OrderStatusLookup.Pending.AsInt(),
                TotalAmount = checkout.TotalPrice,
                Note = checkout.Note,
                BillingAddressId = billingAddressId,
                ShippingAddressId = shippingAddressId,
                GeneratedOrderId = checkout.GeneratedOrderId,
                CreatedAt = DateTime.UtcNow
            };

            var createdOrder = context.Orders.Add(order);
            await SaveChangesAsync();

            return createdOrder.Entity;
        }

        private async Task CreateOrderItemsAsync(int orderId, IEnumerable<OrderItemModel> items)
        {
            foreach (var item in items)
            {
                var orderItem = new OrderItem
                {
                    OrderId = orderId,
                    PrdId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = (decimal)item.Price,
                    CreatedAt = DateTime.UtcNow
                };

                context.OrderItems.Add(orderItem);
            }

            await SaveChangesAsync();
        }

        #endregion Checkout

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