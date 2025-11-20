using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Subscribe;
using NHD.Core.Services.Model.Subscribe;

namespace NHD.Core.Services.Subscribe
{
    public class EmailSubscriptionService : IEmailSubscriptionService
    {
        private readonly IEmailSubscriptionRepository _emailSubscriptionRepository;
        private readonly ILogger<EmailSubscriptionService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public EmailSubscriptionService(IEmailSubscriptionRepository emailSubscriptionRepository, ILogger<EmailSubscriptionService> logger, IHttpContextAccessor httpContextAccessor)
        {
            _emailSubscriptionRepository = emailSubscriptionRepository;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedServiceResult<IEnumerable<SubscribeViewModel>>> GetSubscriptionsAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<SubscribeViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _emailSubscriptionRepository.GetEmailSubscriptionsAsync(page, limit);
                var subscriptionDtos = pagedResult.Data.Select(MapToSubscription).ToList();

                return PagedServiceResult<IEnumerable<SubscribeViewModel>>.Success(
                    subscriptionDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscriptions");
                return PagedServiceResult<IEnumerable<SubscribeViewModel>>.Failure("An error occurred while retrieving subscriptions");
            }
        }


        public async Task<ServiceResult<EmailSubscription>> UnsubscribeAsync(string email)
        {
            try
            {
                var subscription = await _emailSubscriptionRepository.GetByEmailAsync(email);

                if (subscription.IsUnsubscribed)
                {
                    return ServiceResult<EmailSubscription>.Failure("Email is already unsubscribed.");
                }

                subscription.IsUnsubscribed = true;
                subscription.DateUnsubscribed = DateTime.UtcNow;

                await _emailSubscriptionRepository.UpdateAsync(subscription);
                return ServiceResult<EmailSubscription>.Success(subscription);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error unsubscribing email");
                return ServiceResult<EmailSubscription>.Failure("An error occurred while unsubscribing the email.");
            }
        }

        public async Task<ServiceResult<EmailSubscription>> SubscribeAsync(string email)
        {
            try
            {
                var existingSubscription = await _emailSubscriptionRepository.GetByEmailAsync(email);

                // If subscription exists
                if (existingSubscription != null)
                {
                    // If previously unsubscribed → resubscribe
                    if (existingSubscription.IsUnsubscribed)
                    {
                        existingSubscription.IsUnsubscribed = false;
                        existingSubscription.DateUnsubscribed = null;

                        await _emailSubscriptionRepository.UpdateAsync(existingSubscription);

                        return ServiceResult<EmailSubscription>.Success(existingSubscription);
                    }

                    // Otherwise it's already subscribed
                    return ServiceResult<EmailSubscription>.Failure("Email is already subscribed.");
                }
                var context = _httpContextAccessor.HttpContext;
                var ipAddress = context?.Connection.RemoteIpAddress?.ToString();
                var userAgent = context?.Request.Headers["User-Agent"].ToString();
                // Create a new subscription
                var newSubscription = new EmailSubscription
                {
                    EmailAddress = email,
                    DateSubscribed = DateTime.UtcNow,
                    IsUnsubscribed = false,
                    IsActive = true,
                    IpAddress = ipAddress,
                    UserAgent = userAgent
                };

                await _emailSubscriptionRepository.AddAsync(newSubscription);

                return ServiceResult<EmailSubscription>.Success(newSubscription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error subscribing email");
                return ServiceResult<EmailSubscription>.Failure("An error occurred while subscribing the email.");
            }
        }


        private SubscribeViewModel MapToSubscription(Models.EmailSubscription subscription)
        {
            return new SubscribeViewModel
            {
                Id = subscription.SubscriptionId,
                EmailAddress = subscription.EmailAddress,
                IsUnsubscribed = subscription.IsUnsubscribed,
                DateSubscribed = subscription.DateSubscribed,
                DateUnsubscribed = subscription.DateUnsubscribed,
                IpAddress = subscription.IpAddress,
                UserAgent = subscription.UserAgent,
                IsActive = subscription.IsActive
            };
        }
    }
}