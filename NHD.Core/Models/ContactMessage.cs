using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class ContactMessage
{
    public int ContactId { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public string EmailAddress { get; set; }

    public string Message { get; set; }

    public string IpAddress { get; set; }

    public string Phone { get; set; }

    public int SubjectLookupId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual GenLookup SubjectLookup { get; set; }
}
