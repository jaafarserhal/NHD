using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class Role
{
    public int RoleId { get; set; }

    public string Name { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
