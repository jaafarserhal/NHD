using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.CustomerCart
{
    public class CartModel
    {
        public int CartId { get; set; }
        public int CustomerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public List<CartItemResponseModel> CartItems { get; set; } = new List<CartItemResponseModel>();
        public decimal TotalPrice => CartItems?.Sum(item => item.Subtotal) ?? 0;
        public int TotalItems => CartItems?.Sum(item => item.Quantity) ?? 0;
    }

    public class CartItemResponseModel
    {
        public int CartItemId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public ProductModel Product { get; set; }
        public decimal Subtotal => (Product?.FromPrice ?? 0) * Quantity;
    }

    public class ProductModel
    {
        public int Id { get; set; }
        public string TitleEn { get; set; }
        public string TitleSv { get; set; }
        public string DescriptionEn { get; set; }
        public string DescriptionSv { get; set; }
        public string ImageUrl { get; set; }
        public decimal? FromPrice { get; set; }
        public bool? IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool? IsCarousel { get; set; }
        public string BadgeEn { get; set; }
        public string BadgeSv { get; set; }
    }
}