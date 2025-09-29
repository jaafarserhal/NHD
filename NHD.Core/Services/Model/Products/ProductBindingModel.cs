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
        public string NameEn { get; set; }
        public string NameSv { get; set; }
        public decimal FromPrice { get; set; }
        public string DescriptionEn { get; set; }
        public string DescriptionSv { get; set; }
        public int DatesFillingId { get; set; }
        public int CategoryId { get; set; }
        public int TypeId { get; set; }
        public int SizeId { get; set; }
        public IFormFile ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public List<DatesProductBindingModel> Dates { get; set; } = new List<DatesProductBindingModel>();
    }

    public class DatesProductBindingModel
    {
        public int Id { get; set; }
        public int PrdId { get; set; }
        public int DateId { get; set; }
        public bool IsFilled { get; set; }
        public int Quantity { get; set; }
    }
}