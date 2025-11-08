using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace NHD.Core.Services.Model.Sections
{
    public class SectionViewModel
    {
        public int Id { get; set; }
        public string TitleEn { get; set; }
        public string TitleSv { get; set; }
        public string DescriptionEn { get; set; }
        public string DescriptionSv { get; set; }
        public string ImageUrl { get; set; }
        public IFormFile ImageFile { get; set; }
        public int TypeId { get; set; }
        public string TypeName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}