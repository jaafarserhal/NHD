using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NHD.Core.Services.Model.ContactMessages
{
    public class ContactMessagesViewModel
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }

        public string Phone { get; set; }
        public string Subject { get; set; }
        public int SubjectId { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}