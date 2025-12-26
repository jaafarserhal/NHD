using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Models;

namespace NHD.Core.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public bool InMemoryDatabase { get; }
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { InMemoryDatabase = options.Extensions.Any(item => item.GetType().Name == "InMemoryOptionsExtension"); }

    public virtual DbSet<Address> Addresses { get; set; }

    public virtual DbSet<Collection> Collections { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Date> Dates { get; set; }

    public virtual DbSet<DatesProduct> DatesProducts { get; set; }

    public virtual DbSet<EmailSubscription> EmailSubscriptions { get; set; }

    public virtual DbSet<Gallery> Galleries { get; set; }

    public virtual DbSet<GenLookup> GenLookups { get; set; }

    public virtual DbSet<GenLookupType> GenLookupTypes { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<PaymentGateway> PaymentGateways { get; set; }

    public virtual DbSet<PaymentTransaction> PaymentTransactions { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductCollection> ProductCollections { get; set; }

    public virtual DbSet<Section> Sections { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) => optionsBuilder.UseSqlServer($"Name=ConnectionStrings:{Utilities.AppConstants.CONNECTION_NAME}");


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(e => e.AddressId).HasName("PK__address__CAA247C859D762FF");

            entity.ToTable("address");

            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.AddressTypeLookupId).HasColumnName("address_type_lookup_id");
            entity.Property(e => e.City)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("city");
            entity.Property(e => e.ContactFirstName)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("contact_firstName");
            entity.Property(e => e.ContactLastName)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("contact_lastName");
            entity.Property(e => e.ContactPhone)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnName("contact_phone");
            entity.Property(e => e.CountryCode)
                .IsRequired()
                .HasMaxLength(2)
                .IsUnicode(false)
                .HasDefaultValue("SE")
                .IsFixedLength()
                .HasColumnName("country_code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsPrimary).HasColumnName("is_primary");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.PostalCode)
                .IsRequired()
                .HasMaxLength(5)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("postal_code");
            entity.Property(e => e.StreetName)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("street_name");
            entity.Property(e => e.StreetNumber)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnName("street_number");

            entity.HasOne(d => d.AddressTypeLookup).WithMany(p => p.Addresses)
                .HasForeignKey(d => d.AddressTypeLookupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_address_type_lookup");

            entity.HasOne(d => d.Customer).WithMany(p => p.Addresses)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_address_customer");
        });

        modelBuilder.Entity<Collection>(entity =>
        {
            entity.HasKey(e => e.CollectionId).HasName("PK__dates_co__53D3A5CA2428DE11");

            entity.ToTable("collections");

            entity.Property(e => e.CollectionId).HasColumnName("collection_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DescriptionEn).HasColumnName("description_en");
            entity.Property(e => e.DescriptionSv).HasColumnName("description_sv");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.NameEn)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("name_en");
            entity.Property(e => e.NameSv)
                .HasMaxLength(255)
                .HasColumnName("name_sv");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__customer__CD65CB85FBF460DD");

            entity.ToTable("customer");

            entity.HasIndex(e => e.EmailAddress, "IX_customer_email");

            entity.HasIndex(e => e.EmailAddress, "UQ__customer__20C6DFF54D84F4FD").IsUnique();

            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.EmailAddress)
                .IsRequired()
                .HasMaxLength(150)
                .HasColumnName("email_address");
            entity.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("first_name");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsGuest).HasColumnName("is_guest");
            entity.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("last_name");
            entity.Property(e => e.Mobile)
                .HasMaxLength(50)
                .HasColumnName("mobile");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.ProviderId).HasColumnName("provider_id");
            entity.Property(e => e.StatusLookupId).HasColumnName("status_lookup_id");

            entity.HasOne(d => d.StatusLookup).WithMany(p => p.Customers)
                .HasForeignKey(d => d.StatusLookupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_customer_status_lookup");
        });

        modelBuilder.Entity<Date>(entity =>
        {
            entity.HasKey(e => e.DateId).HasName("PK__dates__51FC486528DF0C81");

            entity.ToTable("dates");

            entity.Property(e => e.DateId).HasColumnName("date_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DescriptionEn).HasColumnName("description_en");
            entity.Property(e => e.DescriptionSv).HasColumnName("description_sv");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsFilled).HasColumnName("is_filled");
            entity.Property(e => e.NameEn)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("name_en");
            entity.Property(e => e.NameSv)
                .HasMaxLength(100)
                .HasColumnName("name_sv");
            entity.Property(e => e.Quality).HasColumnName("quality");
            entity.Property(e => e.UnitPrice)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("unit_price");
            entity.Property(e => e.WeightPrice)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("weight_price");
        });

        modelBuilder.Entity<DatesProduct>(entity =>
        {
            entity.HasKey(e => e.DpId).HasName("PK__dates_pr__B5B1AAFCA8DE0292");

            entity.ToTable("dates_product");

            entity.HasIndex(e => new { e.PrdId, e.DateId, e.IsFilled, e.IsPerWeight }, "UQ_dates_product").IsUnique();

            entity.Property(e => e.DpId).HasColumnName("dp_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DateId).HasColumnName("date_id");
            entity.Property(e => e.IsFilled).HasColumnName("is_filled");
            entity.Property(e => e.IsPerWeight).HasColumnName("is_per_weight");
            entity.Property(e => e.PrdId).HasColumnName("prd_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");

            entity.HasOne(d => d.Date).WithMany(p => p.DatesProducts)
                .HasForeignKey(d => d.DateId)
                .HasConstraintName("FK_dates_product_dates");

            entity.HasOne(d => d.Prd).WithMany(p => p.DatesProducts)
                .HasForeignKey(d => d.PrdId)
                .HasConstraintName("FK_dates_product_product");
        });

        modelBuilder.Entity<EmailSubscription>(entity =>
        {
            entity.HasKey(e => e.SubscriptionId).HasName("PK__email_su__863A7EC141F07CC8");

            entity.ToTable("email_subscription");

            entity.HasIndex(e => e.EmailAddress, "UQ__email_su__20C6DFF534CD1B5C").IsUnique();

            entity.Property(e => e.SubscriptionId).HasColumnName("subscription_id");
            entity.Property(e => e.DateSubscribed)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("date_subscribed");
            entity.Property(e => e.DateUnsubscribed)
                .HasColumnType("datetime")
                .HasColumnName("date_unsubscribed");
            entity.Property(e => e.EmailAddress)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("email_address");
            entity.Property(e => e.IpAddress)
                .HasMaxLength(45)
                .HasColumnName("ip_address");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsUnsubscribed).HasColumnName("is_unsubscribed");
            entity.Property(e => e.UserAgent)
                .HasMaxLength(500)
                .HasColumnName("user_agent");
        });

        modelBuilder.Entity<Gallery>(entity =>
        {
            entity.HasKey(e => e.GalleryId).HasName("PK__product___43D54A71F1CEC753");

            entity.ToTable("gallery");

            entity.Property(e => e.GalleryId).HasColumnName("gallery_id");
            entity.Property(e => e.AltText)
                .HasMaxLength(255)
                .HasColumnName("alt_text");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DateId).HasColumnName("date_id");
            entity.Property(e => e.FileSizeKb).HasColumnName("file_size_kb");
            entity.Property(e => e.ImageUrl)
                .IsRequired()
                .HasMaxLength(500)
                .HasColumnName("image_url");
            entity.Property(e => e.IsPrimary).HasColumnName("is_primary");
            entity.Property(e => e.MimeType)
                .HasMaxLength(100)
                .HasColumnName("mime_type");
            entity.Property(e => e.PrdId).HasColumnName("prd_id");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order");

            entity.HasOne(d => d.Date).WithMany(p => p.Galleries)
                .HasForeignKey(d => d.DateId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_product_gallery_dates");

            entity.HasOne(d => d.Prd).WithMany(p => p.Galleries)
                .HasForeignKey(d => d.PrdId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_product_gallery_product");
        });

        modelBuilder.Entity<GenLookup>(entity =>
        {
            entity.HasKey(e => e.LookupId).HasName("PK__gen_look__E492CAE4F093F4E4");

            entity.ToTable("gen_lookup");

            entity.Property(e => e.LookupId)
                .ValueGeneratedNever()
                .HasColumnName("lookup_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LookupTypeId).HasColumnName("lookup_type_id");
            entity.Property(e => e.NameEn)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("name_en");
            entity.Property(e => e.NameSv)
                .HasMaxLength(100)
                .HasColumnName("name_sv");

            entity.HasOne(d => d.LookupType).WithMany(p => p.GenLookups)
                .HasForeignKey(d => d.LookupTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_gen_lookup_type");
        });

        modelBuilder.Entity<GenLookupType>(entity =>
        {
            entity.HasKey(e => e.LookupTypeId).HasName("PK__gen_look__6999207B27EA8685");

            entity.ToTable("gen_lookup_type");

            entity.Property(e => e.LookupTypeId)
                .ValueGeneratedNever()
                .HasColumnName("lookup_type_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.NameEn)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("name_en");
            entity.Property(e => e.NameSv)
                .HasMaxLength(100)
                .HasColumnName("name_sv");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__order__4659622906867E95");

            entity.ToTable("order");

            entity.HasIndex(e => e.CustomerId, "IX_order_customer");

            entity.HasIndex(e => e.OrderDate, "IX_order_date");

            entity.HasIndex(e => e.OrderStatusLookupId, "IX_order_status");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("order_date");
            entity.Property(e => e.OrderStatusLookupId).HasColumnName("order_status_lookup_id");
            entity.Property(e => e.PaymentGatewayId).HasColumnName("payment_gateway_id");
            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("total_amount");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_order_customer");

            entity.HasOne(d => d.OrderStatusLookup).WithMany(p => p.Orders)
                .HasForeignKey(d => d.OrderStatusLookupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_order_status");

            entity.HasOne(d => d.PaymentGateway).WithMany(p => p.Orders)
                .HasForeignKey(d => d.PaymentGatewayId)
                .HasConstraintName("FK_order_payment_gateway");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId).HasName("PK__order_it__3764B6BCECC10D7B");

            entity.ToTable("order_item");

            entity.HasIndex(e => e.OrderId, "IX_orderitem_order");

            entity.HasIndex(e => e.PrdId, "IX_orderitem_product");

            entity.Property(e => e.OrderItemId).HasColumnName("order_item_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PrdId).HasColumnName("prd_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UnitPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("unit_price");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_orderitem_order");

            entity.HasOne(d => d.Prd).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.PrdId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_orderitem_product");
        });

        modelBuilder.Entity<PaymentGateway>(entity =>
        {
            entity.HasKey(e => e.PaymentGatewayId).HasName("PK__payment___E4C06EF689627D73");

            entity.ToTable("payment_gateway");

            entity.Property(e => e.PaymentGatewayId).HasColumnName("payment_gateway_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.ProviderCode)
                .HasMaxLength(50)
                .HasColumnName("provider_code");
        });

        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(e => e.PaymentTransactionId).HasName("PK__payment___3DE9AF960FB87AC6");

            entity.ToTable("payment_transaction");

            entity.HasIndex(e => e.OrderId, "IX_payment_transaction_order");

            entity.Property(e => e.PaymentTransactionId).HasColumnName("payment_transaction_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PaymentGatewayId).HasColumnName("payment_gateway_id");
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnName("status");
            entity.Property(e => e.TransactionReference)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("transaction_reference");

            entity.HasOne(d => d.Order).WithMany(p => p.PaymentTransactions)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_payment_transaction_order");

            entity.HasOne(d => d.PaymentGateway).WithMany(p => p.PaymentTransactions)
                .HasForeignKey(d => d.PaymentGatewayId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_payment_transaction_gateway");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.PrdId).HasName("PK__product__CE5CB94899484F7D");

            entity.ToTable("product");

            entity.HasIndex(e => e.IsActive, "IX_product_active");

            entity.HasIndex(e => e.PrdLookupCategoryId, "IX_product_category");

            entity.HasIndex(e => e.PrdLookupSizeId, "IX_product_size");

            entity.HasIndex(e => e.PrdLookupTypeId, "IX_product_type");

            entity.Property(e => e.PrdId).HasColumnName("prd_id");
            entity.Property(e => e.BadgeEn)
                .HasMaxLength(100)
                .HasColumnName("badge_en");
            entity.Property(e => e.BadgeSv)
                .HasMaxLength(100)
                .HasColumnName("badge_sv");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DescriptionEn).HasColumnName("description_en");
            entity.Property(e => e.DescriptionSv).HasColumnName("description_sv");
            entity.Property(e => e.FromPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("from_price");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsCarousel).HasColumnName("is_carousel");
            entity.Property(e => e.NameEn)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("name_en");
            entity.Property(e => e.NameSv)
                .HasMaxLength(200)
                .HasColumnName("name_sv");
            entity.Property(e => e.PrdLookupCategoryId).HasColumnName("prd_lookup_category_id");
            entity.Property(e => e.PrdLookupSizeId).HasColumnName("prd_lookup_size_id");
            entity.Property(e => e.PrdLookupTypeId).HasColumnName("prd_lookup_type_id");

            entity.HasOne(d => d.PrdLookupCategory).WithMany(p => p.ProductPrdLookupCategories)
                .HasForeignKey(d => d.PrdLookupCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_product_category");

            entity.HasOne(d => d.PrdLookupSize).WithMany(p => p.ProductPrdLookupSizes)
                .HasForeignKey(d => d.PrdLookupSizeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_product_size");

            entity.HasOne(d => d.PrdLookupType).WithMany(p => p.ProductPrdLookupTypes)
                .HasForeignKey(d => d.PrdLookupTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_product_type");
        });

        modelBuilder.Entity<ProductCollection>(entity =>
        {
            entity.HasKey(e => e.ProductCollectionId).HasName("PK__product___4E908F0B0BF168C3");

            entity.ToTable("product_collection");

            entity.HasIndex(e => new { e.ProductId, e.CollectionId }, "UQ_product_collection").IsUnique();

            entity.Property(e => e.ProductCollectionId).HasColumnName("product_collection_id");
            entity.Property(e => e.CollectionId).HasColumnName("collection_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.ProductId).HasColumnName("product_id");

            entity.HasOne(d => d.Collection).WithMany(p => p.ProductCollections)
                .HasForeignKey(d => d.CollectionId)
                .HasConstraintName("FK_product_collection_collection");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductCollections)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK_product_collection_product");
        });

        modelBuilder.Entity<Section>(entity =>
        {
            entity.HasKey(e => e.SectionId).HasName("PK__sections__F842676AAF9F9743");

            entity.ToTable("sections");

            entity.Property(e => e.SectionId).HasColumnName("section_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DescriptionEn).HasColumnName("description_en");
            entity.Property(e => e.DescriptionSv).HasColumnName("description_sv");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.TitleEn)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("title_en");
            entity.Property(e => e.TitleSv)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("title_sv");
            entity.Property(e => e.TypeLookupId).HasColumnName("type_lookup_id");

            entity.HasOne(d => d.TypeLookup).WithMany(p => p.Sections)
                .HasForeignKey(d => d.TypeLookupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_sections_type_lookup");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__user__B9BE370FB0180710");

            entity.ToTable("user");

            entity.HasIndex(e => e.EmailAddress, "IX_user_email");

            entity.HasIndex(e => e.EmailAddress, "UQ__user__20C6DFF51B048AF4").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.EmailAddress)
                .IsRequired()
                .HasMaxLength(150)
                .HasColumnName("email_address");
            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(150)
                .HasColumnName("full_name");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Password)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("password");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
