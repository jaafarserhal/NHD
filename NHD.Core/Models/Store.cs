using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Store
{
    public int StoreId { get; set; }

    public int StoreCategoryId { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public string Address { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public string PhoneNumber { get; set; }

    public string Email { get; set; }

    public string WebsiteUrl { get; set; }

    public string StoreImageUrl { get; set; }

    public TimeOnly? OpeningTime { get; set; }

    public TimeOnly? ClosingTime { get; set; }

    public string OperatingDays { get; set; }

    public bool? IsVerified { get; set; }

    public int? TotalReviews { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual GenLookup StoreCategory { get; set; }
}
