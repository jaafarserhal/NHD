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
        public static string CleanUtf8Text(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            try
            {
                // Handle common encoding issues where text was incorrectly decoded
                // This fixes issues where UTF-8 text was incorrectly interpreted as Latin-1
                var bytes = System.Text.Encoding.GetEncoding("ISO-8859-1").GetBytes(input);
                var correctedText = System.Text.Encoding.UTF8.GetString(bytes);

                // Only return the corrected text if it's actually different and doesn't contain replacement characters
                if (correctedText != input && !correctedText.Contains("\uFFFD"))
                {
                    return correctedText;
                }
            }
            catch
            {
                // If conversion fails, return original
            }

            return input;
        }
    }
}