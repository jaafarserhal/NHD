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

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<GenLookup> GenLookups { get; set; }

    public virtual DbSet<GenLookuptype> GenLookuptypes { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Store> Stores { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UsersCode> UsersCodes { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) => optionsBuilder.UseNpgsql($"Name=ConnectionStrings:{Utilities.AppConstants.DEV_CONNECTION_NAME}");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("customers_pkey");

            entity.ToTable("customers");

            entity.HasIndex(e => e.Email, "idx_customers_email");

            entity.HasIndex(e => new { e.Latitude, e.Longitude }, "idx_customers_lat_lon");

            entity.HasIndex(e => e.Phone, "idx_customers_phone");

            entity.HasIndex(e => e.UserId, "idx_customers_user_id").IsUnique();

            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.Latitude)
                .HasPrecision(10, 7)
                .HasColumnName("latitude");
            entity.Property(e => e.Longitude)
                .HasPrecision(10, 7)
                .HasColumnName("longitude");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(150)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.Customer)
                .HasForeignKey<Customer>(d => d.UserId)
                .HasConstraintName("fk_user");
        });

        modelBuilder.Entity<GenLookup>(entity =>
        {
            entity.HasKey(e => e.LookupId).HasName("gen_lookup_pkey");

            entity.ToTable("gen_lookup");

            entity.Property(e => e.LookupId).HasColumnName("lookup_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.LookupTypeId).HasColumnName("lookup_type_id");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("name");

            entity.HasOne(d => d.LookupType).WithMany(p => p.GenLookups)
                .HasForeignKey(d => d.LookupTypeId)
                .HasConstraintName("fk_lookup_type");
        });

        modelBuilder.Entity<GenLookuptype>(entity =>
        {
            entity.HasKey(e => e.LookupTypeId).HasName("gen_lookuptype_pkey");

            entity.ToTable("gen_lookuptype");

            entity.HasIndex(e => e.Name, "gen_lookuptype_name_key").IsUnique();

            entity.Property(e => e.LookupTypeId).HasColumnName("lookup_type_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("roles_pkey");

            entity.ToTable("roles");

            entity.HasIndex(e => e.Name, "roles_name_key").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.StoreId).HasName("stores_pkey");

            entity.ToTable("stores");

            entity.HasIndex(e => e.CreatedAt, "idx_stores_created_at");

            entity.HasIndex(e => e.IsActive, "idx_stores_is_active");

            entity.HasIndex(e => e.IsVerified, "idx_stores_is_verified");

            entity.HasIndex(e => new { e.Latitude, e.Longitude }, "idx_stores_lat_lon");

            entity.HasIndex(e => e.StoreCategoryId, "idx_stores_store_category_id");

            entity.Property(e => e.StoreId).HasColumnName("store_id");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.ClosingTime).HasColumnName("closing_time");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsVerified)
                .HasDefaultValue(false)
                .HasColumnName("is_verified");
            entity.Property(e => e.Latitude)
                .HasPrecision(10, 7)
                .HasColumnName("latitude");
            entity.Property(e => e.Longitude)
                .HasPrecision(10, 7)
                .HasColumnName("longitude");
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(150)
                .HasColumnName("name");
            entity.Property(e => e.OpeningTime).HasColumnName("opening_time");
            entity.Property(e => e.OperatingDays)
                .HasMaxLength(100)
                .HasColumnName("operating_days");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phone_number");
            entity.Property(e => e.StoreCategoryId).HasColumnName("store_category_id");
            entity.Property(e => e.StoreImageUrl).HasColumnName("store_image_url");
            entity.Property(e => e.TotalReviews)
                .HasDefaultValue(0)
                .HasColumnName("total_reviews");
            entity.Property(e => e.WebsiteUrl).HasColumnName("website_url");

            entity.HasOne(d => d.StoreCategory).WithMany(p => p.Stores)
                .HasForeignKey(d => d.StoreCategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_store_category");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.HashPassword)
                .IsRequired()
                .HasColumnName("hash_password");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(100)
                .HasColumnName("phone_number");
            entity.Property(e => e.RoleId).HasColumnName("role_id");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_role");
        });

        modelBuilder.Entity<UsersCode>(entity =>
        {
            entity.HasKey(e => e.UserCodeId).HasName("userscode_pkey");

            entity.ToTable("users_code");

            entity.Property(e => e.UserCodeId)
                .HasDefaultValueSql("nextval('userscode_user_code_id_seq'::regclass)")
                .HasColumnName("user_code_id");
            entity.Property(e => e.Code)
                .IsRequired()
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.ExpirationTime).HasColumnName("expiration_time");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.StatusLookupId).HasColumnName("status_lookup_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.StatusLookup).WithMany(p => p.UsersCodes)
                .HasForeignKey(d => d.StatusLookupId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_status_lookup");

            entity.HasOne(d => d.User).WithMany(p => p.UsersCodes)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_users");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
