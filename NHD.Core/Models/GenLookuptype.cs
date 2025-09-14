using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class GenLookupType
{
    public int LookupTypeId { get; set; }

    public string NameEn { get; set; }

    public string NameSv { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<GenLookup> GenLookups { get; set; } = new List<GenLookup>();
}
