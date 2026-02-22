using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Properties
{
    public class PropertiesViewModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string ValueEn { get; set; }
        public string ValueSv { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}