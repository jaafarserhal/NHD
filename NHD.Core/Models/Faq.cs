using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Faq
{
    public int FaqId { get; set; }

    public string QuestionEn { get; set; }

    public string QuestionSv { get; set; }

    public string AnswerEn { get; set; }

    public string AnswerSv { get; set; }

    public int TypeLookupId { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    public virtual GenLookup TypeLookup { get; set; }
}
