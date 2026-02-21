using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class GenSystemParameter
{
    public int SystemParameterId { get; set; }

    public string ValueEn { get; set; }

    public string ValueSv { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Title { get; set; }
}
