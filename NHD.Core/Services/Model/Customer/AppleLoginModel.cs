using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Customer
{
    public class AppleLoginModel
    {
        public string IdentityToken { get; set; } // JWT from Apple
        public string AuthCode { get; set; }     // Authorization code from Apple
        public string FirstName { get; set; }    // User's first name (only on first sign-in)
        public string LastName { get; set; }     // User's last name (only on first sign-in)
        public string Email { get; set; }        // User's email
        public string ProviderId { get; set; }   // Unique Apple user identifier
    }
}