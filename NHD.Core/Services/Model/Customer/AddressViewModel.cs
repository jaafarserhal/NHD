using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Customer
{
    public class AddressViewModel
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string StreetName { get; set; }
        public string StreetNumber { get; set; }
        public string PostalCode { get; set; }
        public string City { get; set; }
        public string Type { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}