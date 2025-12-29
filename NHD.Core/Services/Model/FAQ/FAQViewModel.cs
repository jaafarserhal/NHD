using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.FAQ
{
    public class FAQViewModel
    {
        public int Id { get; set; }
        public string QuestionEn { get; set; }
        public string QuestionSv { get; set; }
        public string AnswerEn { get; set; }
        public string AnswerSv { get; set; }
        public string Type { get; set; }
        public int TypeId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
}