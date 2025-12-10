using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Customer
{
    public class CustomerRegistrationModel
    {
        public int Id { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Mobile { get; set; }
        public string ProviderId { get; set; } // Google sub, Apple sub
        public string EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationTokenExpires { get; set; }
    }
}