using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace NHD.Core.Services.Model.Dates
{
    public class DateViewModel
    {
        public int Id { get; set; }
        public int CollectionId { get; set; }
        public string CollectionName { get; set; }
        public string NameEn { get; set; }
        public string NameSv { get; set; }

        public bool Quality { get; set; }
        public decimal UnitPrice { get; set; }

        public decimal WeightPrice { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

    }

    public class DatesCollectionViewModel
    {
        public int Id { get; set; }
        public string NameEn { get; set; }
        public string NameSv { get; set; }
        public string ImageUrl { get; set; }
        public IFormFile ImageFile { get; set; }
        public string DescriptionEn { get; set; }
        public string DescriptionSv { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool CanDelete { get; set; }
    }
}