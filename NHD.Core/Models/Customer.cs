using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Customer
{
    public int CustomerId { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public string EmailAddress { get; set; }

    public string Password { get; set; }

    public string Mobile { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public bool IsGuest { get; set; }

    public string ProviderId { get; set; }

    public int StatusLookupId { get; set; }

    public string EmailVerificationToken { get; set; }

    public DateTime? EmailVerificationTokenExpires { get; set; }

    public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();

    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual GenLookup StatusLookup { get; set; }
}
