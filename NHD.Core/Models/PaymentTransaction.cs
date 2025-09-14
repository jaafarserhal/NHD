using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class PaymentTransaction
{
    public int PaymentTransactionId { get; set; }

    public int OrderId { get; set; }

    public int PaymentGatewayId { get; set; }

    public string TransactionReference { get; set; }

    public decimal Amount { get; set; }

    public string Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Order Order { get; set; }

    public virtual PaymentGateway PaymentGateway { get; set; }
}
