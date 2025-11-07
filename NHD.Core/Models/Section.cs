using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Section
{
    public int SectionId { get; set; }

    public string TitleEn { get; set; }

    public string TitleSv { get; set; }

    public string DescriptionEn { get; set; }

    public string DescriptionSv { get; set; }

    public string ImageUrl { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool? IsHomeSlider { get; set; }
}
