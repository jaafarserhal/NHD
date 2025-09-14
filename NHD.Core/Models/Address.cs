using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Address
{
    public int AddressId { get; set; }

    public int CustomerId { get; set; }

    public string Street { get; set; }

    public string City { get; set; }

    public string Land { get; set; }

    public string PostalCode { get; set; }

    public string Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual Customer Customer { get; set; }
}
