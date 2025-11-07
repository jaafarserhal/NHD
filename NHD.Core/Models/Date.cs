using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Date
{
    public int DateId { get; set; }

    public string NameEn { get; set; }

    public string NameSv { get; set; }

    public bool Quality { get; set; }

    public decimal UnitPrice { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    public decimal WeightPrice { get; set; }

    public string DescriptionEn { get; set; }

    public string DescriptionSv { get; set; }

    public virtual ICollection<DatesProduct> DatesProducts { get; set; } = new List<DatesProduct>();

    public virtual ICollection<Gallery> Galleries { get; set; } = new List<Gallery>();
}
