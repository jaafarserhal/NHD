using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Subscribe
{
    public interface IEmailSubscriptionRepository : IRepository<EmailSubscription>
    {
        Task<PagedResult<EmailSubscription>> GetEmailSubscriptionsAsync(int page, int limit);
        Task<EmailSubscription> GetByEmailAsync(string email);
    }
}