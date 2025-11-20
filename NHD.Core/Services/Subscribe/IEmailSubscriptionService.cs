using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model.Subscribe;

namespace NHD.Core.Services.Subscribe
{
    public interface IEmailSubscriptionService
    {
        Task<PagedServiceResult<IEnumerable<SubscribeViewModel>>> GetSubscriptionsAsync(int page = 1, int limit = 10);
        Task<ServiceResult<EmailSubscription>> UnsubscribeAsync(string email);
        Task<ServiceResult<EmailSubscription>> SubscribeAsync(string email);
    }
}