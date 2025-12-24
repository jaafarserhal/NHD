using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Address
{
    public int AddressId { get; set; }

    public int CustomerId { get; set; }

    public string StreetName { get; set; }

    public string StreetNumber { get; set; }

    public string PostalCode { get; set; }

    public string City { get; set; }

    public string CountryCode { get; set; }

    public int AddressTypeLookupId { get; set; }

    public bool IsPrimary { get; set; }

    public string Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    public string ContactFirstName { get; set; }

    public string ContactLastName { get; set; }

    public string ContactPhone { get; set; }

    public virtual GenLookup AddressTypeLookup { get; set; }

    public virtual Customer Customer { get; set; }
}
