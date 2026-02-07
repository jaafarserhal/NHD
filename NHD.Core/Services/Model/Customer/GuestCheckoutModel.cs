using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Customer
{
    public class GuestCheckoutModel
    {
        public string Email { get; set; }

        public GuestAddressModel Shipping { get; set; }
        public GuestAddressModel Billing { get; set; }

        public List<OrderItemModel> Items { get; set; }

        public bool IsBillingSameAsShipping { get; set; }

        public string Note { get; set; }

        public decimal TotalPrice { get; set; }
    }
    public class GuestAddressModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        public string StreetName { get; set; }
        public string StreetNumber { get; set; }
        [MaxLength(5)]
        public string PostalCode { get; set; }
        public string City { get; set; }
        public int TypeId { get; set; }
    }

    public class OrderItemModel
    {
        public int ProductId { get; set; }
        public double Price { get; set; }
        public int Quantity { get; set; }
    }

}