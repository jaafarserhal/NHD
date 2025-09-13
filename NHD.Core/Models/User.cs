﻿using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class User
{
    public int UserId { get; set; }

    public int RoleId { get; set; }

    public string Email { get; set; }

    public string FullName { get; set; }

    public string HashPassword { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string PhoneNumber { get; set; }

    public virtual Customer Customer { get; set; }

    public virtual Role Role { get; set; }

    public virtual ICollection<UsersCode> UsersCodes { get; set; } = new List<UsersCode>();
}
