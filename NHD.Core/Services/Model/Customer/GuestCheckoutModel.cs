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

        public OrderAddressModel Shipping { get; set; }
        public OrderAddressModel Billing { get; set; }

        public List<OrderItemModel> Items { get; set; }

        public bool IsBillingSameAsShipping { get; set; }

        public string Note { get; set; }

        public decimal TotalPrice { get; set; }

        // Payment information
        public string PaymentIntentId { get; set; }

        public string GeneratedOrderId { get; set; }
    }

    public class CustomerCheckoutModel
    {
        public OrderAddressModel Shipping { get; set; }
        public OrderAddressModel Billing { get; set; }

        public List<OrderItemModel> Items { get; set; }

        public bool IsBillingSameAsShipping { get; set; }

        public string Note { get; set; }

        public decimal TotalPrice { get; set; }

        // Payment information
        public string PaymentIntentId { get; set; }

        public string GeneratedOrderId { get; set; }
    }
    public class OrderAddressModel
    {
        public int? Id { get; set; } // Optional for guest checkout
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