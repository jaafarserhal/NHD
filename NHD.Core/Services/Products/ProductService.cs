using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.DatesFilling;
using NHD.Core.Repository.Lookup;
using NHD.Core.Repository.Products;
using NHD.Core.Services.Model;
using NHD.Core.Services.Model.Products;
using NHD.Core.Utilities;

namespace NHD.Core.Services.Products
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ILookupRepository _lookupRepository;

        private readonly IDatesFillingRepository _datesFillingRepository;
        private readonly ILogger<ProductService> _logger;

        public ProductService(IProductRepository productRepository, ILookupRepository lookupRepository, IDatesFillingRepository datesFillingRepository, ILogger<ProductService> logger)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _lookupRepository = lookupRepository ?? throw new ArgumentNullException(nameof(lookupRepository));
            _datesFillingRepository = datesFillingRepository ?? throw new ArgumentNullException(nameof(datesFillingRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

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

            await _productRepository.DeleteAsync(product.PrdId);
            return ServiceResult<bool>.Success(true);
        }

        public async Task<ServiceResult<IEnumerable<LookupItemDto>>> GetDatesFillingAsync()
        {
            try
            {
                var datesFilling = await _datesFillingRepository.GetAllAsync();
                var datesFillingDtos = datesFilling.Select(d => new LookupItemDto
                {
                    Id = d.DatesFillingId,
                    NameEn = d.NameEn,
                    NameSv = d.NameSv
                });
                return ServiceResult<IEnumerable<LookupItemDto>>.Success(datesFillingDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dates filling");
                return ServiceResult<IEnumerable<LookupItemDto>>.Failure("An error occurred while retrieving dates filling");
            }
        }

        public async Task<decimal> CalculatePriceByFillingIdAndSizeId(int datesFillingId, int sizeId)
        {
            try
            {
                var data = await _datesFillingRepository.GetByIdAsync(datesFillingId);

                if (data == null)
                    return 0;

                decimal price = data.Price;
                return sizeId switch
                {
                    (int)ProductSizeEnum.Pieces_8 => 8 * price,
                    (int)ProductSizeEnum.Pieces_20 => 20 * price,
                    (int)ProductSizeEnum.Pieces_35 => 35 * price,
                    _ => 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating price");
                return 0;
            }
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
                DatesFilling = product.DatesFilling?.NameEn,
                DatesFillingId = product.DatesFillingId,
                TypeId = product.PrdLookupTypeId,
                SizeId = product.PrdLookupSizeId,
                Type = product.PrdLookupType?.NameEn,
                Size = product.PrdLookupSize?.NameEn,
                ImageUrl = product.ImageUrl ?? null,
                Price = product.Price,
                IsActive = product.IsActive ?? false,
                CreatedAt = product.CreatedAt
            };
        }
        #endregion Mappers
    }
}