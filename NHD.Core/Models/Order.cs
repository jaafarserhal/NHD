using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int CustomerId { get; set; }

    public DateTime OrderDate { get; set; }

    public int OrderStatusLookupId { get; set; }

    public int? PaymentGatewayId { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; }

    public string GuestEmail { get; set; }

    public virtual Customer Customer { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual GenLookup OrderStatusLookup { get; set; }

    public virtual PaymentGateway PaymentGateway { get; set; }

    public virtual ICollection<PaymentTransaction> PaymentTransactions { get; set; } = new List<PaymentTransaction>();
}
