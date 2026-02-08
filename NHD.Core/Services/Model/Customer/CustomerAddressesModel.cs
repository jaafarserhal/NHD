using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Customer
{
    public class CustomerAddressesModel
    {
        public string Email { get; set; }
        public int ShippingAddressId { get; set; }
        public int BillingAddressId { get; set; }
    }
}