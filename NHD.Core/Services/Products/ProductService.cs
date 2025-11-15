using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.DateProducts;
using NHD.Core.Repository.Dates;
using NHD.Core.Repository.Lookup;
using NHD.Core.Repository.Products;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Dates;
using NHD.Core.Services.Model.Products;
using NHD.Core.Utilities;
using NHD.Core.Repository.ImageGallery;
using NHD.Core.Repository.Collections;

namespace NHD.Core.Services.Products
{
    public class ProductService : IProductService
    {
        protected internal AppDbContext context;
        private readonly IProductRepository _productRepository;
        private readonly ILookupRepository _lookupRepository;
        private readonly IDateProductsRepository _dateProductsRepository;
        private readonly ICollectionRepository _collectionRepository;

        private readonly IProductCollectionRepository _productCollectionRepository;

        private readonly IGalleryRepository _galleryRepository;

        private readonly IDatesRepository _datesRepository;

        private readonly ILogger<ProductService> _logger;

        protected internal IDbContextTransaction Transaction;

        public ProductService(AppDbContext context, IProductRepository productRepository, ILookupRepository lookupRepository, IDateProductsRepository dateProductsRepository, IGalleryRepository galleryRepository, IDatesRepository datesRepository, ILogger<ProductService> logger, ICollectionRepository collectionRepository, IProductCollectionRepository productCollectionRepository)
        {
            this.context = context ?? throw new ArgumentNullException(nameof(context));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _lookupRepository = lookupRepository ?? throw new ArgumentNullException(nameof(lookupRepository));
            _dateProductsRepository = dateProductsRepository ?? throw new ArgumentNullException(nameof(dateProductsRepository));
            _galleryRepository = galleryRepository ?? throw new ArgumentNullException(nameof(galleryRepository));
            _datesRepository = datesRepository ?? throw new ArgumentNullException(nameof(datesRepository));
            _collectionRepository = collectionRepository ?? throw new ArgumentNullException(nameof(collectionRepository));
            _productCollectionRepository = productCollectionRepository ?? throw new ArgumentNullException(nameof(productCollectionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Homepage
        public async Task<ServiceResult<IEnumerable<ProductViewModel>>> GetCarouselProductsAsync()
        {
            try
            {
                var products = await _productRepository.GetCarouselProductsAsync();
                var productDtos = products.Select(MapToProductDto).ToList();
                return ServiceResult<IEnumerable<ProductViewModel>>.Success(productDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving carousel products");
                return ServiceResult<IEnumerable<ProductViewModel>>.Failure("An error occurred while retrieving carousel products");
            }
        }

        public async Task<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>> GetProductsByCategoryAsync(int categoryId, bool isCarousel, int take)
        {
            try
            {
                var products = await _productRepository.GetProductsByCategoryAsync(categoryId, isCarousel, take);
                var productDtos = products.Select(p => new ProductsWithGalleryViewModel()
                {
                    Id = p.PrdId,
                    TitleEn = p.NameEn,
                    TitleSv = p.NameSv,
                    DescriptionEn = p.DescriptionEn,
                    DescriptionSv = p.DescriptionSv,
                    ImageUrl = $"/uploads/products/{p.ImageUrl}",
                    FromPrice = p.FromPrice ?? 0,
                    Type = p.PrdLookupType?.NameEn,
                    Size = p.PrdLookupSize?.NameEn,
                    Galleries = p.Galleries != null ? p.Galleries.Select(g => new GalleryViewModel
                    {
                        Id = g.GalleryId,
                        AltText = g.AltText,
                        ImageUrl = $"/uploads/products/{g.ImageUrl}",
                    }).ToList() : new List<GalleryViewModel>()

                }).ToList();
                return ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>.Success(productDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products by category");
                return ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>.Failure("An error occurred while retrieving products by category");
            }
        }


        public async Task<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>> GetFillDatesProducts()
        {
            try
            {
                var products = await _productRepository.GetProductsByTypeAsync(BoxTypeEnum.FilledDate.AsInt(), 3);
                var productDtos = products.Select(p => new ProductsWithGalleryViewModel()
                {
                    Id = p.PrdId,
                    TitleEn = p.NameEn,
                    TitleSv = p.NameSv,
                    DescriptionEn = p.DescriptionEn,
                    DescriptionSv = p.DescriptionSv,
                    ImageUrl = $"/uploads/products/{p.ImageUrl}",
                    FromPrice = p.FromPrice ?? 0,
                    Type = p.PrdLookupType?.NameEn,
                    Size = p.PrdLookupSize?.NameEn,
                    Galleries = p.Galleries != null ? p.Galleries.Where(ga => ga.IsPrimary == false).Select(g => new GalleryViewModel
                    {
                        Id = g.GalleryId,
                        AltText = g.AltText,
                        ImageUrl = $"/uploads/products/{g.ImageUrl}",
                    }).ToList() : new List<GalleryViewModel>()

                }).ToList();
                return ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>.Success(productDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products by category");
                return ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>.Failure("An error occurred while retrieving products by category");
            }
        }

        public async Task<ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>> GetHomeProductsByCategoryAsync(int categoryId = 0)
        {
            try
            {
                var products = await _productRepository.GetHomeProductsByCategoryAsync(categoryId);
                var productDtos = products.Select(p => new ProductsWithGalleryViewModel()
                {
                    Id = p.PrdId,
                    TitleEn = p.NameEn,
                    TitleSv = p.NameSv,
                    DescriptionEn = p.DescriptionEn,
                    DescriptionSv = p.DescriptionSv,
                    ImageUrl = $"/uploads/products/{p.ImageUrl}",
                    FromPrice = p.FromPrice ?? 0,
                    Type = p.PrdLookupType?.NameEn,
                    Size = p.PrdLookupSize?.NameEn,
                    Galleries = p.Galleries != null ? p.Galleries.Where(ga => ga.IsPrimary == false).Select(g => new GalleryViewModel
                    {
                        Id = g.GalleryId,
                        AltText = g.AltText,
                        ImageUrl = $"/uploads/products/{g.ImageUrl}",
                    }).ToList() : new List<GalleryViewModel>()

                }).ToList();
                return ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>.Success(productDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving home products by category");
                return ServiceResult<IEnumerable<ProductsWithGalleryViewModel>>.Failure("An error occurred while retrieving home products by category");
            }
        }
        #endregion Homepage

        #region Products

        public async Task<PagedServiceResult<IEnumerable<ProductViewModel>>> GetProductsAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<ProductViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _productRepository.GetProductsAsync(page, limit);
                var productDtos = pagedResult.Data.Select(MapToProductDto).ToList();

                return PagedServiceResult<IEnumerable<ProductViewModel>>.Success(
                    productDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products");
                return PagedServiceResult<IEnumerable<ProductViewModel>>.Failure("An error occurred while retrieving products");
            }
        }


        public async Task<ServiceResult<ProductViewModel>> GetProductWithDetailsByIdAsync(int id)
        {
            try
            {
                var product = await _productRepository.GetProductByIdAsync(id);
                if (product == null)
                {
                    return ServiceResult<ProductViewModel>.Failure($"Product with ID {id} not found.");
                }

                var productDto = MapToProductDto(product);
                return ServiceResult<ProductViewModel>.Success(productDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving product with ID {id}");
                return ServiceResult<ProductViewModel>.Failure("An error occurred while retrieving the product");
            }
        }

        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetActiveCollectionsAsync()
        {
            try
            {
                var collections = await _collectionRepository.GetActiveCollectionsAsync();
                var collectionDtos = collections.Select(c => new LookupItemDto
                {
                    Id = c.CollectionId,
                    NameEn = c.NameEn,
                    NameSv = c.NameSv
                });
                return ServiceResult<IEnumerable<LookupItemDto>>.Success(collectionDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving date collections");
                return ServiceResult<IEnumerable<LookupItemDto>>.Failure("An error occurred while retrieving date collections");
            }
        }

        public async Task<Product> GetProductAsync(int id)
        {
            return await _productRepository.GetByIdAsync(id);
        }

        public async Task<Product> AddProductAsync(Product product)
        {
            await _productRepository.AddAsync(product);
            return product;
        }

        public async Task<Product> UpdateProductAsync(Product product)
        {
            await _productRepository.UpdateAsync(product);
            return product;
        }

        public async Task<ServiceResult<bool>> DeleteProductAsync(int productId)
        {
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
            {
                return ServiceResult<bool>.Failure($"Product with ID {productId} not found.");
            }

            // Step 1: Get gallery image paths before deleting from DB
            var galleries = await _galleryRepository.GetAllGalleriesByProductIdOrDateIdAsync(productId, null);
            var imagePaths = galleries
                .Where(g => !string.IsNullOrEmpty(g.ImageUrl))
                .Select(g => Path.Combine("wwwroot/uploads/products", g.ImageUrl.TrimStart('/')))
                .ToList();

            try
            {
                // Step 2: Delete the product (cascade will remove galleries)
                await _productRepository.DeleteAsync(product.PrdId);

                // Step 3: Delete files after successful DB deletion
                foreach (var path in imagePaths)
                {
                    try
                    {
                        if (File.Exists(path))
                        {
                            File.Delete(path);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error deleting image file at {path}");
                    }
                }

                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting product with ID {productId}");
                return ServiceResult<bool>.Failure($"An error occurred while deleting the product: {ex.Message}");
            }
        }


        public async Task<ServiceResult<IEnumerable<DateViewModel>>> GetAllDatesAsync()
        {
            try
            {
                var dates = await _datesRepository.GetActiveDatesAsync();
                var dateViewModels = dates.Select(d => new DateViewModel
                {
                    Id = d.DateId,
                    NameEn = d.NameEn,
                    NameSv = d.NameSv,
                    UnitPrice = d.UnitPrice,
                    WeightPrice = d.WeightPrice,
                    Quality = d.Quality,
                });
                return ServiceResult<IEnumerable<DateViewModel>>.Success(dateViewModels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all dates");
                return ServiceResult<IEnumerable<DateViewModel>>.Failure("An error occurred while retrieving dates");
            }
        }

        public async Task<PagedServiceResult<IEnumerable<GalleryViewModel>>> GetGalleriesAsync(int? productId, int? dateId, int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return PagedServiceResult<IEnumerable<GalleryViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var pagedResult = await _galleryRepository.GetGalleriesAsync(productId, dateId, page, limit);
                var productGalleryDtos = pagedResult.Data.Select(MapToProductGalleryDto).ToList();

                return PagedServiceResult<IEnumerable<GalleryViewModel>>.Success(
                    productGalleryDtos,
                    pagedResult.Total,
                    pagedResult.Page,
                    pagedResult.Limit
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product galleries");
                return PagedServiceResult<IEnumerable<GalleryViewModel>>.Failure("An error occurred while retrieving product galleries");
            }
        }

        private async Task<List<ProductCollection>> SaveProductCollectionsAsync(List<ProductCollectionBindingModel> productCollections)
        {
            if (productCollections == null || !productCollections.Any())
                return new List<ProductCollection>();

            var prdId = productCollections.First().ProductId;

            // 1. Remove ALL existing product collections for this product
            var existingRecords = await _productCollectionRepository.GetByProductIdAsync(prdId);
            if (existingRecords.Any())
            {
                context.ProductCollections.RemoveRange(existingRecords);
            }

            var resultList = new List<ProductCollection>();
            var processedCollectionIds = new HashSet<int>();

            // 2. Add only new records
            foreach (var item in productCollections)
            {
                // Skip if we already processed this CollectionId in current batch
                if (processedCollectionIds.Contains(item.CollectionId))
                    continue;

                var entity = new ProductCollection
                {
                    ProductId = item.ProductId,
                    CollectionId = item.CollectionId
                };

                await context.ProductCollections.AddAsync(entity);
                resultList.Add(entity);
                processedCollectionIds.Add(item.CollectionId);
            }

            // 3. Save all changes in one transaction
            await context.SaveChangesAsync();

            return resultList;
        }

        private async Task<List<DatesProduct>> SaveDatesProductsAsync(List<DatesProductBindingModel> datesProducts)
        {
            if (datesProducts == null || !datesProducts.Any())
                return new List<DatesProduct>();

            var prdId = datesProducts.First().PrdId;

            // 1. Remove ALL existing date products for this product
            var existingRecords = await _dateProductsRepository.GetByProductIdAsync(prdId);
            if (existingRecords.Any())
            {
                context.DatesProducts.RemoveRange(existingRecords);
            }

            var resultList = new List<DatesProduct>();
            var processedDateIds = new HashSet<(int, bool)>();

            // 2. Add only new records with quantity > 0
            foreach (var item in datesProducts)
            {
                // Only process items with quantity > 0
                if (item.Quantity > 0)
                {
                    // Skip if we already processed this DateId in current batch
                    if (processedDateIds.Contains((item.DateId, item.IsFilled)))
                        continue;

                    var entity = new DatesProduct
                    {
                        PrdId = item.PrdId,
                        DateId = item.DateId,
                        IsFilled = item.IsFilled,
                        Quantity = item.Quantity,
                        IsPerWeight = item.IsPerWeight
                    };

                    await context.DatesProducts.AddAsync(entity);
                    resultList.Add(entity);
                    processedDateIds.Add((item.DateId, item.IsFilled));
                }
            }

            // 3. Save all changes in one transaction
            await context.SaveChangesAsync();

            return resultList;
        }

        public async Task<Product> SaveProductWithDatesAsync(Product product, List<DatesProductBindingModel> datesProducts, List<ProductCollectionBindingModel> productCollections)
        {
            await BeginTransactionAsync();

            try
            {
                bool isNewProduct = product.PrdId == 0;

                if (isNewProduct)
                {
                    // Add new product
                    await context.Products.AddAsync(product);
                    await SaveChangesAsync(); // Need this to get product.PrdId
                }
                else
                {
                    // Get the existing product from DB
                    var existingProduct = await context.Products
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.PrdId == product.PrdId);

                    if (existingProduct == null)
                        throw new Exception("Product not found");

                    // Update the product
                    context.Products.Update(product);
                    await SaveChangesAsync();

                    if (product.PrdLookupCategoryId == (int)BoxCategoryEnum.DateSweetners)
                    {
                        var existingDatesProducts = await _dateProductsRepository.GetByProductIdAsync(product.PrdId);
                        if (existingDatesProducts.Any())
                        {
                            context.DatesProducts.RemoveRange(existingDatesProducts);
                            await SaveChangesAsync();
                        }
                        datesProducts = new List<DatesProductBindingModel>();
                    }
                }

                // Add/Update dates if provided
                // The SaveDatesProductsAsync method now handles removing existing dates
                if (datesProducts != null && datesProducts.Any())
                {
                    foreach (var dp in datesProducts)
                    {
                        dp.PrdId = product.PrdId;
                    }

                    await SaveDatesProductsAsync(datesProducts);
                }

                // Add/Update collections if provided
                if (productCollections != null && productCollections.Any())
                {
                    foreach (var pc in productCollections)
                    {
                        pc.ProductId = product.PrdId;
                    }

                    await SaveProductCollectionsAsync(productCollections);
                }

                await CommitTransactionAsync();
                return product;
            }
            catch (Exception ex)
            {
                await RollbackTransactionAsync();
                _logger.LogError(ex, "Error saving product with dates");
                return null;
            }
        }

        public async Task<Gallery> AddGalleryAsync(Gallery gallery)
        {
            await _galleryRepository.AddAsync(gallery);
            return gallery;
        }

        public async Task<ServiceResult<bool>> DeleteGalleryAsync(int galleryId)
        {
            var gallery = await _galleryRepository.GetByIdAsync(galleryId);
            if (gallery == null)
            {
                return ServiceResult<bool>.Failure($"Gallery with ID {galleryId} not found.");
            }

            await _galleryRepository.DeleteAsync(galleryId);
            return ServiceResult<bool>.Success(true);
        }

        public async Task<ServiceResult<bool>> DeleteGalleryAsync(int? productId, int? dateId)
        {
            var result = await _galleryRepository.DeleteGalleriesAsync(productId, dateId);
            if (!result)
            {
                return ServiceResult<bool>.Failure($"Product galleries for product ID {productId} and date ID {dateId} not found.");
            }
            return ServiceResult<bool>.Success(true);
        }


        public async Task<Gallery> GetGalleryAsync(int id)
        {
            return await _galleryRepository.GetByIdAsync(id);
        }

        #endregion Products

        #region Lookups
        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetCategoriesAsync()
        {
            try
            {
                var categories = await _lookupRepository.GetProductCategoriesAsync();
                var categoryDtos = categories.Where(c => c.LookupId != (int)BoxCategoryEnum.ChocolateDates).Select(c => new LookupItemDto
                {
                    Id = c.LookupId,
                    NameEn = c.NameEn,
                    NameSv = c.NameSv
                });
                return ServiceResult<IEnumerable<LookupItemDto>>.Success(categoryDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product categories");
                return ServiceResult<IEnumerable<LookupItemDto>>.Failure("An error occurred while retrieving product categories");
            }
        }

        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetTypesAsync()
        {
            try
            {
                var types = await _lookupRepository.GetProductTypesAsync();
                var typeDtos = types.Where(t => t.LookupId != (int)BoxTypeEnum.None).Select(t => new LookupItemDto
                {
                    Id = t.LookupId,
                    NameEn = t.NameEn,
                    NameSv = t.NameSv
                });
                return ServiceResult<IEnumerable<LookupItemDto>>.Success(typeDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product types");
                return ServiceResult<IEnumerable<LookupItemDto>>.Failure("An error occurred while retrieving product types");
            }
        }

        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetSizesAsync()
        {
            try
            {
                var sizes = await _lookupRepository.GetProductSizesAsync();
                var sizeDtos = sizes.Select(s => new LookupItemDto
                {
                    Id = s.LookupId,
                    NameEn = s.NameEn,
                    NameSv = s.NameSv
                });
                return ServiceResult<IEnumerable<LookupItemDto>>.Success(sizeDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product sizes");
                return ServiceResult<IEnumerable<LookupItemDto>>.Failure("An error occurred while retrieving product sizes");
            }
        }
        #endregion Lookups

        #region Mappers
        private ProductViewModel MapToProductDto(Product product)
        {
            return new ProductViewModel
            {
                Id = product.PrdId,
                NameEn = product.NameEn,
                NameSv = product.NameSv,
                DescriptionEn = product.DescriptionEn,
                DescriptionSv = product.DescriptionSv,
                Category = product.PrdLookupCategory?.NameEn,
                CategoryId = product.PrdLookupCategoryId,
                TypeId = product.PrdLookupTypeId,
                SizeId = product.PrdLookupSizeId,
                Type = product.PrdLookupType?.NameEn,
                Size = product.PrdLookupSize?.NameEn,
                ImageUrl = product.ImageUrl ?? null,
                FromPrice = product.FromPrice ?? 0,
                IsCarousel = product.IsCarousel ?? false,
                Dates = product.DatesProducts?.Select(dp => new DatesProductBindingModel
                {
                    Id = dp.DpId,
                    PrdId = dp.PrdId,
                    DateId = dp.DateId,
                    IsFilled = dp.IsFilled,
                    Quantity = dp.Quantity,
                    IsPerWeight = dp.IsPerWeight
                }).ToList() ?? new List<DatesProductBindingModel>(),
                Collections = product.ProductCollections?.Select(pc => new ProductCollectionBindingModel
                {
                    Id = pc.ProductCollectionId,
                    ProductId = pc.ProductId,
                    CollectionId = pc.CollectionId
                }).ToList() ?? new List<ProductCollectionBindingModel>(),
                IsActive = product.IsActive ?? false,
                CreatedAt = product.CreatedAt,

            };
        }

        private GalleryViewModel MapToProductGalleryDto(Gallery gallery)
        {
            return new GalleryViewModel
            {
                Id = gallery.GalleryId,
                Name = gallery.DateId != null ? gallery.Date?.NameEn : gallery.Prd?.NameEn,
                Type = gallery.DateId != null ? "date" : "product",
                AltText = gallery.AltText,
                ImageUrl = gallery.ImageUrl,
                IsPrimary = gallery.IsPrimary,
                SortOrder = gallery.SortOrder,
                CreatedAt = gallery.CreatedAt
            };
        }
        #endregion Mappers

        #region Transactions
        public async Task BeginTransactionAsync()
        {
            if (Transaction == null && !context.InMemoryDatabase)
            {
                Transaction = await context.Database.BeginTransactionAsync();
            }
        }

        public async Task CommitTransactionAsync()
        {
            if (Transaction != null)
            {
                await Transaction.CommitAsync();
            }

            Transaction?.Dispose();
            Transaction = null;
        }

        public async Task RollbackTransactionAsync()
        {
            if (Transaction != null)
            {
                await Transaction.RollbackAsync();
            }
        }

        public Task<int> SaveChangesAsync()
        {
            return context.SaveChangesAsync();
        }

        #endregion Transactions
    }
}