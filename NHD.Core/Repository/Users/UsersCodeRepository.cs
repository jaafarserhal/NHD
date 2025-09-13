using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Repository.Base;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Utilities;

namespace NHD.Core.Repository.Users
{
    public class UsersCodeRepository : Repository<UsersCode>, IUsersCodeRepository
    {

        public UsersCodeRepository(AppDbContext context) : base(context)
        {

        }

        public async Task<UsersCode> GetValidResetCodeAsync(int userId, string resetCode, int expiryMinutes)
        {
            // Find the reset code in the database for the given user and code
            var validResetCode = await _context.UsersCodes
                .Where(rc => rc.UserId == userId && rc.Code == resetCode
                            && rc.IsActive
                            && rc.StatusLookupId == UserCodeStatusLookup.Pending.AsInt())
                .FirstOrDefaultAsync();

            if (validResetCode == null)
            {
                return null; // No reset code found
            }

            // Check if the reset code has expired (more than 15 minutes old)
            if (validResetCode.ExpirationTime < DateTime.UtcNow.AddMinutes(-expiryMinutes))
            {
                return null; // Reset code is expired
            }

            return validResetCode; // Valid reset code
        }

        public async Task<bool> IsUserCodeValid(int userId, string resetCode)
        {
            var lastCode = await _context.UsersCodes
                .Where(rc => rc.UserId == userId && rc.Code == resetCode && rc.IsActive)
                .OrderByDescending(rc => rc.CreatedAt)
                .FirstOrDefaultAsync();

            return lastCode != null
                && lastCode.StatusLookupId == UserCodeStatusLookup.Processed.AsInt();
        }

    }
}