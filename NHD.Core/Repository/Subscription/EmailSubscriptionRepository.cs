using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Subscribe
{
    public class EmailSubscriptionRepository : Repository<EmailSubscription>, IEmailSubscriptionRepository
    {
        public EmailSubscriptionRepository(AppDbContext context) : base(context)
        {
        }
        public async Task<PagedResult<EmailSubscription>> GetEmailSubscriptionsAsync(int page, int limit)
        {
            var query = _context.EmailSubscriptions
                .OrderByDescending(p => p.DateSubscribed);

            var total = await query.CountAsync();

            var emailSubscriptions = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<EmailSubscription>
            {
                Data = emailSubscriptions,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<EmailSubscription> GetByEmailAsync(string email)
        {
            return await _context.EmailSubscriptions.Where(s => s.EmailAddress == email).FirstOrDefaultAsync();
        }
    }
}