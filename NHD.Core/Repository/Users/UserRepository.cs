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

            return await _context.Users.FirstOrDefaultAsync(u => u.Email == username && u.IsActive && u.RoleId == RoleType.Admin.AsInt());
        }

        public async Task<IEnumerable<User>> GetUsersAsync(int page, int limit)
        {
            return await _context.Users
                .Include(u => u.Role)
                .OrderBy(u => u.UserId)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Where(u => u.IsActive)
                .ToListAsync();
        }

    }
}