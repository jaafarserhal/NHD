using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Repository.Base;
using NHD.Core.Models;

namespace NHD.Core.Repository.Users
{
    public interface IUsersCodeRepository : IRepository<UsersCode>
    {
        Task<UsersCode> GetValidResetCodeAsync(int userId, string resetCode, int expiryMinutes);

        Task<bool> IsUserCodeValid(int userId, string resetCode);
    }
}