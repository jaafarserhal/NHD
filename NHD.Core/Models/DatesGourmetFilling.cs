using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class DatesGourmetFilling
{
    public int DatesFillingId { get; set; }

    public string NameEn { get; set; }

    public string NameSv { get; set; }

    public decimal Price { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
