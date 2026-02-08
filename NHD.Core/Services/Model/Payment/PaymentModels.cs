namespace NHD.Core.Services.Model.Payment
{
    public class CreatePaymentIntentRequest
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "usd";
        public string CustomerEmail { get; set; }
        public int? OrderId { get; set; }
        public string Description { get; set; }
    }

    public class PaymentIntentResponse
    {
        public string PaymentIntentId { get; set; }
        public string ClientSecret { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Status { get; set; }
    }

    public class ConfirmPaymentRequest
    {
        public string PaymentIntentId { get; set; }
        public int OrderId { get; set; }
    }

    public class PaymentConfirmationResponse
    {
        public string PaymentIntentId { get; set; }
        public string Status { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public bool IsSuccessful { get; set; }
        public string TransactionReference { get; set; }
    }

    public class PaymentStatusResponse
    {
        public string PaymentIntentId { get; set; }
        public string Status { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public bool IsSuccessful { get; set; }
    }
}