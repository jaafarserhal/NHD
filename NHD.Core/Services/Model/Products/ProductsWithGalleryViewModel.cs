using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Products
{
    public class ProductsWithGalleryViewModel
    {
        public int Id { get; set; }
        public string TitleEn { get; set; }
        public string TitleSv { get; set; }
        public string DescriptionEn { get; set; }
        public string DescriptionSv { get; set; }
        public string ImageUrl { get; set; }
        public decimal FromPrice { get; set; }
        public string Type { get; set; }
        public string Size { get; set; }
        public IEnumerable<ProductGalleryViewModel> Galleries { get; set; }
    }
}