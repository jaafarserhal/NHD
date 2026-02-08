using NHD.Core.Common.Models;
using NHD.Core.Services.Model.Payment;


namespace NHD.Core.Services.Payments
{
    public interface IPaymentService
    {
        Task<ServiceResult<PaymentIntentResponse>> CreatePaymentIntentAsync(CreatePaymentIntentRequest request);
        Task<ServiceResult<PaymentConfirmationResponse>> ConfirmPaymentAsync(ConfirmPaymentRequest request);
        Task<ServiceResult<PaymentStatusResponse>> GetPaymentStatusAsync(string paymentIntentId);
        Task<ServiceResult<bool>> RefundPaymentAsync(string paymentIntentId, decimal? amount = null);
    }
}