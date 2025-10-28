using Microsoft.EntityFrameworkCore;
using NHD.Core.Data;
using NHD.Core.Repository.Users;
using NHD.Core.Services;
using NHD.Core.Utilities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using NHD.Core.Common.Models;
using NHD.Core.Repository.Lookup;
using NHD.Core.Repository.Products;
using NHD.Core.Services.Products;
using NHD.Core.Repository.Dates;
using NHD.Core.Services.Dates;
using NHD.Core.Repository.DateProducts;
using NHD.Core.Repository.ImageGallery;

namespace NHD.Web.UI
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // Register services
        public void ConfigureServices(IServiceCollection services)
        {
            var keycloakDomain = Configuration["Keycloak:Url"];
            var keycloakRealm = Configuration["Keycloak:Realm"];
            var keycloakClientId = Configuration["Keycloak:ClientId"];

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.Authority = $"{keycloakDomain}/realms/{keycloakRealm}";
                    options.Audience = keycloakClientId; // optional, but recommended
                    options.RequireHttpsMetadata = false; // set true in production

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromSeconds(30)
                    };
                });

            services.AddAuthorization();

            services.AddControllers();
            services.AddEndpointsApiExplorer();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    policy.WithOrigins(
                        "http://localhost:3000",
                        "https://www.nawahomeofdates.com"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
                });
            });

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString(AppConstants.CONNECTION_NAME)));

            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "wwwroot";
            });

            RegisterServices(services);
        }

        // Configure the middleware
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            // Static files configuration for SPA
            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = context =>
                {
                    // Add cache headers for static assets
                    if (context.File.Name.EndsWith(".js") || context.File.Name.EndsWith(".css"))
                    {
                        context.Context.Response.Headers.Add("Cache-Control", "public, max-age=31536000");
                    }
                }
            });

            app.UseRouting();

            app.UseCors("AllowReactApp");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                // API routes
                endpoints.MapControllers();
            });

            // SPA fallback - handles React Router routes
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "wwwroot";

                if (env.IsDevelopment())
                {
                    // In development, proxy to React dev server if needed
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:3000");
                }
                else
                {
                    // In production, serve the built React app
                    spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions
                    {
                        OnPrepareResponse = context =>
                        {
                            context.Context.Response.Headers.Add("Cache-Control", "no-cache, no-store");
                            context.Context.Response.Headers.Add("Expires", "-1");
                        }
                    };
                }
            });
        }
        /// <summary>
        /// Registers the services for dependency injection.
        /// </summary>
        /// <param name="services"></param>
        private void RegisterServices(IServiceCollection services)
        {
            services.AddScoped<ILookupRepository, LookupRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<IDatesRepository, DatesRepository>();
            services.AddScoped<IGalleryRepository, GalleryRepository>();
            services.AddScoped<IDateProductsRepository, DateProductsRepository>();
            services.AddScoped<IDatesCollectionRepository, DatesCollectionRepository>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IDatesService, DatesService>();
        }
    }
}
