using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class EmailSubscription
{
    public int SubscriptionId { get; set; }

    public string EmailAddress { get; set; }

    public bool IsUnsubscribed { get; set; }

    public DateTime DateSubscribed { get; set; }

    public DateTime? DateUnsubscribed { get; set; }

    public string IpAddress { get; set; }

    public string UserAgent { get; set; }

    public bool IsActive { get; set; }
}
