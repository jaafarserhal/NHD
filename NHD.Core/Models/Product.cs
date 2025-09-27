﻿using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Product
{
    public int PrdId { get; set; }

    public int PrdLookupCategoryId { get; set; }

    public int PrdLookupTypeId { get; set; }

    public int PrdLookupSizeId { get; set; }

    public string NameEn { get; set; }

    public string NameSv { get; set; }

    public string DescriptionEn { get; set; }

    public string DescriptionSv { get; set; }

    public string ImageUrl { get; set; }

    public decimal? FromPrice { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<DatesProduct> DatesProducts { get; set; } = new List<DatesProduct>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual GenLookup PrdLookupCategory { get; set; }

    public virtual GenLookup PrdLookupSize { get; set; }

    public virtual GenLookup PrdLookupType { get; set; }
}
