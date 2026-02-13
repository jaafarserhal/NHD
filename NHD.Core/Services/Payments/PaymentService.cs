using Stripe;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NHD.Core.Services.Model.Payment;
using NHD.Core.Data;
using NHD.Core.Models;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Utilities;

namespace NHD.Core.Services.Payments
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentService> _logger;
        private readonly AppDbContext _context;
        private readonly PaymentIntentService _paymentIntentService;

        public PaymentService(IConfiguration configuration, ILogger<PaymentService> logger, AppDbContext context)
        {
            _configuration = configuration;
            _logger = logger;
            _context = context;

            // Configure Stripe API key
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
            _paymentIntentService = new PaymentIntentService();
        }

        public async Task<ServiceResult<PaymentIntentResponse>> CreatePaymentIntentAsync(CreatePaymentIntentRequest request)
        {
            try
            {
                _logger.LogInformation("Creating Stripe payment intent for amount: {Amount}", request.Amount);

                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(request.Amount * 100), // Convert to cents
                    Currency = request.Currency?.ToLower(),
                    PaymentMethodTypes = new List<string> { "card" },
                    Metadata = new Dictionary<string, string>
                    {
                        { "order_id", request.OrderId?.ToString() ?? "" },
                        { "customer_email", request.CustomerEmail ?? "" }
                    },
                    Description = $"Order payment - {request.Description ?? "NHD Order"}"
                };

                // Add customer if provided
                if (!string.IsNullOrEmpty(request.CustomerEmail))
                {
                    options.ReceiptEmail = request.CustomerEmail;
                }

                var paymentIntent = await _paymentIntentService.CreateAsync(options);

                var response = new PaymentIntentResponse
                {
                    PaymentIntentId = paymentIntent.Id,
                    ClientSecret = paymentIntent.ClientSecret,
                    Amount = request.Amount,
                    Currency = paymentIntent.Currency,
                    Status = paymentIntent.Status
                };

                _logger.LogInformation("Payment intent created successfully: {PaymentIntentId}", paymentIntent.Id);
                return ServiceResult<PaymentIntentResponse>.Success(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment intent for amount: {Amount}", request.Amount);
                return ServiceResult<PaymentIntentResponse>.Failure($"Failed to create payment intent: {ex.Message}");
            }
        }

        public async Task<ServiceResult<PaymentConfirmationResponse>> ConfirmPaymentAsync(ConfirmPaymentRequest request)
        {
            try
            {
                _logger.LogInformation("Confirming payment for payment intent: {PaymentIntentId}", request.PaymentIntentId);

                var paymentIntent = await _paymentIntentService.GetAsync(request.PaymentIntentId);

                if (paymentIntent == null)
                {
                    return ServiceResult<PaymentConfirmationResponse>.Failure("Payment intent not found");
                }

                // Record payment transaction
                await RecordPaymentTransactionAsync(request.PaymentIntentId, request.OrderId, paymentIntent);

                var response = new PaymentConfirmationResponse
                {
                    PaymentIntentId = paymentIntent.Id,
                    Status = paymentIntent.Status,
                    Amount = (decimal)(paymentIntent.Amount / 100.0), // Convert from cents
                    Currency = paymentIntent.Currency,
                    IsSuccessful = paymentIntent.Status == "succeeded",
                    TransactionReference = paymentIntent.Id
                };

                _logger.LogInformation("Payment confirmed: {PaymentIntentId}, Status: {Status}", paymentIntent.Id, paymentIntent.Status);
                return ServiceResult<PaymentConfirmationResponse>.Success(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming payment: {PaymentIntentId}", request.PaymentIntentId);
                return ServiceResult<PaymentConfirmationResponse>.Failure($"Failed to confirm payment: {ex.Message}");
            }
        }

        public async Task<ServiceResult<PaymentStatusResponse>> GetPaymentStatusAsync(string paymentIntentId)
        {
            try
            {
                _logger.LogInformation("Getting payment status for: {PaymentIntentId}", paymentIntentId);

                var paymentIntent = await _paymentIntentService.GetAsync(paymentIntentId);

                if (paymentIntent == null)
                {
                    return ServiceResult<PaymentStatusResponse>.Failure("Payment intent not found");
                }

                var response = new PaymentStatusResponse
                {
                    PaymentIntentId = paymentIntent.Id,
                    Status = paymentIntent.Status,
                    Amount = (decimal)(paymentIntent.Amount / 100.0), // Convert from cents
                    Currency = paymentIntent.Currency,
                    IsSuccessful = paymentIntent.Status == "succeeded"
                };

                return ServiceResult<PaymentStatusResponse>.Success(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment status: {PaymentIntentId}", paymentIntentId);
                return ServiceResult<PaymentStatusResponse>.Failure($"Failed to get payment status: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> RefundPaymentAsync(string paymentIntentId, decimal? amount = null)
        {
            try
            {
                _logger.LogInformation("Processing refund for payment intent: {PaymentIntentId}, Amount: {Amount}", paymentIntentId, amount);

                var refundService = new RefundService();
                var options = new RefundCreateOptions
                {
                    PaymentIntent = paymentIntentId
                };

                if (amount.HasValue)
                {
                    options.Amount = (long)(amount.Value * 100); // Convert to cents
                }

                var refund = await refundService.CreateAsync(options);

                _logger.LogInformation("Refund created successfully: {RefundId}", refund.Id);
                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing refund for payment intent: {PaymentIntentId}", paymentIntentId);
                return ServiceResult<bool>.Failure($"Failed to process refund: {ex.Message}");
            }
        }

        private async Task RecordPaymentTransactionAsync(string paymentIntentId, int orderId, PaymentIntent paymentIntent)
        {
            try
            {
                // Get or create Stripe payment gateway
                var paymentGateway = await _context.PaymentGateways
                    .FirstOrDefaultAsync(pg => pg.ProviderCode == "STRIPE" && pg.IsActive);

                if (paymentGateway == null)
                {
                    // Create Stripe payment gateway if it doesn't exist
                    paymentGateway = new PaymentGateway
                    {
                        Name = "Stripe",
                        ProviderCode = "STRIPE",
                        Description = "Stripe Payment Gateway",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.PaymentGateways.Add(paymentGateway);
                    await _context.SaveChangesAsync();
                }

                // Create payment transaction record
                var transaction = new PaymentTransaction
                {
                    OrderId = orderId,
                    PaymentGatewayId = paymentGateway.PaymentGatewayId,
                    TransactionReference = paymentIntentId,
                    Amount = (decimal)(paymentIntent.Amount / 100.0), // Convert from cents
                    Status = paymentIntent.Status,
                    CreatedAt = DateTime.UtcNow
                };

                _context.PaymentTransactions.Add(transaction);

                // Update order with payment gateway reference
                var order = await _context.Orders.FindAsync(orderId);
                if (order != null)
                {
                    order.PaymentGatewayId = paymentGateway.PaymentGatewayId;
                    order.OrderStatusLookupId = paymentIntent.Status == "succeeded" ? OrderStatusLookup.Paid.AsInt() : OrderStatusLookup.PaymentFailed.AsInt();
                    _context.Orders.Update(order);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment transaction recorded: OrderId: {OrderId}, TransactionRef: {TransactionRef}", orderId, paymentIntentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording payment transaction: OrderId: {OrderId}, PaymentIntentId: {PaymentIntentId}", orderId, paymentIntentId);
                // Don't throw here as payment was successful, just log the error
            }
        }
    }
}