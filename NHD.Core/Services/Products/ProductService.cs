using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Products;
using NHD.Core.Services.Model.Products;

namespace NHD.Core.Services.Products
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ILogger<ProductService> _logger;

        public ProductService(IProductRepository productRepository, ILogger<ProductService> logger)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

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

    }
}