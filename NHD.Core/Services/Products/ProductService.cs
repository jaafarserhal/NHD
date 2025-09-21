using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Lookup;
using NHD.Core.Repository.Products;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Products;

namespace NHD.Core.Services.Products
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ILookupRepository _lookupRepository;
        private readonly ILogger<ProductService> _logger;

        public ProductService(IProductRepository productRepository, ILookupRepository lookupRepository, ILogger<ProductService> logger)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _lookupRepository = lookupRepository ?? throw new ArgumentNullException(nameof(lookupRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Products

        public async Task<ServiceResult<IEnumerable<ProductViewModel>>> GetProductsAsync(int page = 1, int limit = 10)
        {
            try
            {
                if (page <= 0 || limit <= 0)
                {
                    return ServiceResult<IEnumerable<ProductViewModel>>.Failure("Page and limit must be greater than 0");
                }

                var products = await _productRepository.GetProductsAsync(page, limit);
                var productDtos = products.Select(MapToProductDto).ToList();

                return ServiceResult<IEnumerable<ProductViewModel>>.Success(productDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products");
                return ServiceResult<IEnumerable<ProductViewModel>>.Failure("An error occurred while retrieving products");
            }
        }

        private ProductViewModel MapToProductDto(Product product)
        {
            return new ProductViewModel
            {
                Id = product.PrdId,
                Name = product.NameEn,
                Category = product.PrdLookupCategory?.NameEn,
                Type = product.PrdLookupType?.NameEn,
                Size = product.PrdLookupSize?.NameEn,
                ImageUrl = product.ImageUrl,
                Price = product.Price,
                IsActive = product.IsActive ?? false,
                CreatedAt = product.CreatedAt
            };
        }

        public async Task<Product> AddProductAsync(Product product)
        {
            await _productRepository.AddAsync(product);
            return product;
        }

        #endregion Products


        #region Lookups
        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetCategoriesAsync()
        {
            try
            {
                var categories = await _lookupRepository.GetProductCategoriesAsync();
                var categoryDtos = categories.Select(c => new LookupItemDto
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
                var typeDtos = types.Select(t => new LookupItemDto
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
    }
}