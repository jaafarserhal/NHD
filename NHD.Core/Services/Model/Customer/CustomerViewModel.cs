using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.Customer
{
    public class CustomerViewModel
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Mobile { get; set; }
        public string Status { get; set; }
        public int StatusId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}