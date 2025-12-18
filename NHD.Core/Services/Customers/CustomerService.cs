using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Customers;
using NHD.Core.Services.Model.Customer;
using NHD.Core.Utilities;

namespace NHD.Core.Services.Customers
{
    public class CustomerService : ICustomerService
    {
        protected internal AppDbContext context;
        private readonly ICustomerRepository _customerRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<CustomerService> _logger;
        protected internal IDbContextTransaction Transaction;

        public CustomerService(AppDbContext context, ICustomerRepository customerRepository, IEmailService emailService, ILogger<CustomerService> logger)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
            _customerRepository = customerRepository ?? throw new ArgumentNullException(nameof(customerRepository));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
                var co = CommonUtilities.HashPassword(password);
                if (customer == null || customer.Password != CommonUtilities.HashPassword(password))
                {
                    return AppApiResponse<Customer>.Failure("Invalid email or password", HttpStatusCodeEnum.Unauthorized);
                }

                return AppApiResponse<Customer>.Success(customer, "Login successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return AppApiResponse<Customer>.Failure("User login failed");
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