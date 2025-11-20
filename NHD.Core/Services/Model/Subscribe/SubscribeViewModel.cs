using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Subscribe
{
    public class SubscribeViewModel
    {
        public int Id { get; set; }

        public string EmailAddress { get; set; }

        public bool IsUnsubscribed { get; set; }

        public DateTime DateSubscribed { get; set; }

        public DateTime? DateUnsubscribed { get; set; }

        public string IpAddress { get; set; }

        public string UserAgent { get; set; }

        public bool IsActive { get; set; }
    }
}