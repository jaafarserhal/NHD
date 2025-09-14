using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class OrderItem
{
    public int OrderItemId { get; set; }

    public int OrderId { get; set; }

    public int PrdId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Order Order { get; set; }

    public virtual Product Prd { get; set; }
}
