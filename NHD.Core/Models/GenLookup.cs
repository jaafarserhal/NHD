using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class GenLookup
{
    public int LookupId { get; set; }

    public int LookupTypeId { get; set; }

    public string NameEn { get; set; }

    public string NameSv { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();

    public virtual ICollection<ContactMessage> ContactMessages { get; set; } = new List<ContactMessage>();

    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public virtual GenLookupType LookupType { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Product> ProductPrdLookupCategories { get; set; } = new List<Product>();

    public virtual ICollection<Product> ProductPrdLookupSizes { get; set; } = new List<Product>();

    public virtual ICollection<Product> ProductPrdLookupTypes { get; set; } = new List<Product>();

    public virtual ICollection<Section> Sections { get; set; } = new List<Section>();
}
