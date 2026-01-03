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
        public bool? IsFilled { get; set; }
        public bool IsActive { get; set; }
        public string ImageUrl { get; set; }
        public IFormFile ImageFile { get; set; }
        public DateTime CreatedAt { get; set; }
        public string DescriptionEn { get; set; }
        public string DescriptionSv { get; set; }
        public List<DatesAdditionalInfoBindingModel> AdditionalInfos { get; set; }

    }

    public class DatesAdditionalInfoBindingModel
    {
        public int Id { get; set; }
        public int DateId { get; set; }
        public string KeyEn { get; set; }
        public string KeySv { get; set; }
        public string ValueEn { get; set; }
        public string ValueSv { get; set; }
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