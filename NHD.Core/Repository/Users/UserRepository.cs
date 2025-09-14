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
    public class UserRepository : Repository<User>, IUserRepository
    {

        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<User> GetByUsernameAsync(string username)
        {

            return await _context.Users.FirstOrDefaultAsync(u => u.EmailAddress == username && u.IsActive == true);
        }

        public async Task<IEnumerable<User>> GetUsersAsync(int page, int limit)
        {
            return await _context.Users
                .OrderBy(u => u.UserId)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Where(u => u.IsActive == true)
                .ToListAsync();
        }

    }
}