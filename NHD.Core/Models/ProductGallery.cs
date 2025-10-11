using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class ProductGallery
{
    public int GalleryId { get; set; }

    public int PrdId { get; set; }

    public string ImageUrl { get; set; }

    public string AltText { get; set; }

    public string MimeType { get; set; }

    public int? FileSizeKb { get; set; }

    public bool IsPrimary { get; set; }

    public int? SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Product Prd { get; set; }
}
