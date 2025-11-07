using System;
using System.Collections.Generic;

namespace NHD.Core.Models;

public partial class ProductCollection
{
    public int ProductId { get; set; }

    public int CollectionId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual DatesCollection Collection { get; set; }

    public virtual Product Product { get; set; }
}
