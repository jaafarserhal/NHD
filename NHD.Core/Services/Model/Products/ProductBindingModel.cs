using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace NHD.Core.Services.Model.Products
{
    public class ProductBindingModel
    {
        public int Id { get; set; }
        public string NameEN { get; set; }
        public string NameSV { get; set; }

        public string DescriptionEN { get; set; }
        public string DescriptionSV { get; set; }
        public int CategoryId { get; set; }
        public int TypeId { get; set; }
        public int SizeId { get; set; }
        public IFormFile ImageUrl { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
    }
}