using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Customer
{
    public class GoogleLoginModel
    {
        public string IdToken { get; set; }        // JWT from Google
        public string AccessToken { get; set; }    // Access token from Google
        public string FirstName { get; set; }      // User's first name
        public string LastName { get; set; }       // User's last name
        public string Email { get; set; }          // User's email
        public string ProviderId { get; set; }     // Unique Google user identifier (sub claim)
        public string Picture { get; set; }        // User's profile picture URL
    }
}