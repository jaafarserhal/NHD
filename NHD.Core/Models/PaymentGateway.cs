using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class PaymentGateway
{
    public int PaymentGatewayId { get; set; }

    public string Name { get; set; }

    public string ProviderCode { get; set; }

    public string Description { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<PaymentTransaction> PaymentTransactions { get; set; } = new List<PaymentTransaction>();
}
