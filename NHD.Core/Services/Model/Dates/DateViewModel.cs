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
        public string NameEn { get; set; }
        public string NameSv { get; set; }

        public bool Quality { get; set; }
        public decimal UnitPrice { get; set; }

        public decimal WeightPrice { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

    }

    public class DatesWithGalleryViewModel
    {
        public int Id { get; set; }
        public string NameEn { get; set; }
        public string NameSv { get; set; }
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
    }
}