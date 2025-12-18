using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Customer
{
    public class ResetPasswordModel
    {
        public string Token { get; set; }
        public string Password { get; set; }
    }
}