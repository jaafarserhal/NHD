using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class DatesCollection
{
    public int CollectionId { get; set; }

    public string NameEn { get; set; }

    public string NameSv { get; set; }

    public string DescriptionEn { get; set; }

    public string DescriptionSv { get; set; }

    public string ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<Date> Dates { get; set; } = new List<Date>();
}
