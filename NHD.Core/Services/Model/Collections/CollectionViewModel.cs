using Microsoft.AspNetCore.Http;
namespace NHD.Core.Services.Model.Collections
{
    public class CollectionViewModel
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