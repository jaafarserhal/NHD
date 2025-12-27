using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.ContactMessages
{
    public class ContactMessagesRepository : Repository<ContactMessage>, IContactMessagesRepository
    {
        public ContactMessagesRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<ContactMessage>> GetContactMessagesAsync(int page, int limit)
        {
            var query = _context.ContactMessages
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();

            var contactMessages = await query
                .Include(cm => cm.SubjectLookup)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<ContactMessage>
            {
                Data = contactMessages,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<ContactMessage> GetContactMessageByIdAsync(int id)
        {
            return await _context.ContactMessages
                .Include(cm => cm.SubjectLookup)
                .FirstOrDefaultAsync(cm => cm.ContactId == id);
        }
    }
}