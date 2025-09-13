using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Repository.Base;
using NHD.Core.Models;

namespace NHD.Core.Repository.Users
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User> GetByUsernameAsync(string username);

        Task<IEnumerable<User>> GetUsersAsync(int page, int limit);
    }
}