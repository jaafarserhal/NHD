using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Products
{
    public class ProductViewModel
    {
        public int Id { get; set; }
        public string NameEn { get; set; }
        public string NameSv { get; set; }
        public string DescriptionEn { get; set; }
        public string DescriptionSv { get; set; }
        public string Category { get; set; }
        public int CategoryId { get; set; }
        public int DatesFillingId { get; set; }
        public string DatesFilling { get; set; }
        public string Type { get; set; }
        public int TypeId { get; set; }
        public string Size { get; set; }
        public int SizeId { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}