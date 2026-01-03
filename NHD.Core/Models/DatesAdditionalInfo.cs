using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class DatesAdditionalInfo
{
    public int DaId { get; set; }

    public int DateId { get; set; }

    public string KeyEn { get; set; }

    public string ValueEn { get; set; }

    public string KeySv { get; set; }

    public string ValueSv { get; set; }

    public virtual Date Date { get; set; }
}
