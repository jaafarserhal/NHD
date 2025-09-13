using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace NHD.Core.Utilities
{
    public class CommonUtilities
    {

        public static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
        public static string GenerateResetCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }
}