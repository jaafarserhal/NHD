using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.CustomerCart
{
    public class CartItemModel
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
    public class AddToCartRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class SyncCartRequest
    {
        public List<CartItemModel> CartItems { get; set; } = new List<CartItemModel>();
    }
}