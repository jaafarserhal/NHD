using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class DatesProduct
{
    public int DpId { get; set; }

    public int PrdId { get; set; }

    public int DateId { get; set; }

    public bool IsFilled { get; set; }

    public DateTime CreatedAt { get; set; }

    public int Quantity { get; set; }

    public virtual Date Date { get; set; }

    public virtual Product Prd { get; set; }
}
