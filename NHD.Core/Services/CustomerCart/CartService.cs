using Microsoft.Extensions.Logging;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.CustomerCart;
using NHD.Core.Repository.Customers;
using NHD.Core.Repository.Products;
using NHD.Core.Services.Model.CustomerCart;

namespace NHD.Core.Services.CustomerCart
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IProductRepository _productRepository;
        private readonly ILogger<CartService> _logger;

        public CartService(ICartRepository cartRepository, ICustomerRepository customerRepository, IProductRepository productRepository, ILogger<CartService> logger)
        {
            _cartRepository = cartRepository ?? throw new ArgumentNullException(nameof(cartRepository));
            _customerRepository = customerRepository ?? throw new ArgumentNullException(nameof(customerRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ServiceResult<CartModel>> GetUserCartModelAsync(int customerId)
        {
            try
            {
                var cart = await _cartRepository.GetCartByUserIdAsync(customerId);
                var cartModel = MapToCartModel(cart);
                return ServiceResult<CartModel>.Success(cartModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cart for user {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<Cart> GetUserCartAsync(int customerId)
        {
            try
            {
                return await _cartRepository.GetCartByUserIdAsync(customerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cart for user {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<int> GetCustomerIdByEmail(string email)
        {
            int customerId = await _customerRepository.GetCustomerIdByEmailAsync(email);
            if (customerId == 0)
            {
                throw new InvalidOperationException("Customer not found");
            }
            return customerId;
        }

        public async Task<CartModel> AddToCartAsync(int customerId, int productId, int quantity = 1)
        {
            try
            {
                // First, get the product to validate quantity
                var product = await _productRepository.GetByIdAsync(productId);
                if (product == null)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found.");
                }

                var cart = await _cartRepository.GetCartByUserIdAsync(customerId);
                if (cart == null)
                {
                    cart = await _cartRepository.CreateCartAsync(customerId);
                }

                var existingCartItem = await _cartRepository.GetCartItemAsync(cart.CartId, productId);
                var currentQuantityInCart = existingCartItem?.Quantity ?? 0;
                var newTotalQuantity = currentQuantityInCart + quantity;

                // Validate quantity against available stock
                if (newTotalQuantity > product.Quantity)
                {
                    throw new InvalidOperationException($"Cannot add {quantity} item(s). Only {product.Quantity} available in stock, and you already have {currentQuantityInCart} in your cart.");
                }

                if (existingCartItem != null)
                {
                    existingCartItem.Quantity = newTotalQuantity;
                    await _cartRepository.UpdateCartItemAsync(existingCartItem);
                }
                else
                {
                    var newCartItem = new CartItem
                    {
                        CartId = cart.CartId,
                        ProductId = productId,
                        Quantity = quantity
                    };
                    await _cartRepository.AddCartItemAsync(newCartItem);
                }

                await _cartRepository.UpdateCartAsync(cart);
                var updatedCart = await _cartRepository.GetCartByUserIdAsync(customerId);
                return MapToCartModel(updatedCart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding product {ProductId} to cart for user {CustomerId}", productId, customerId);
                throw;
            }
        }

        public async Task<CartModel> UpdateCartItemQuantityAsync(int customerId, int productId, int quantity)
        {
            try
            {
                // First, get the product to validate quantity
                var product = await _productRepository.GetByIdAsync(productId);
                if (product == null)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found.");
                }

                var cart = await _cartRepository.GetCartByUserIdAsync(customerId);
                if (cart == null)
                {
                    throw new InvalidOperationException("Cart not found for user");
                }

                var cartItem = await _cartRepository.GetCartItemAsync(cart.CartId, productId);
                if (cartItem == null)
                {
                    throw new InvalidOperationException("Cart item not found");
                }

                if (quantity <= 0)
                {
                    await _cartRepository.DeleteCartItemAsync(cartItem.CartItemId);
                }
                else
                {
                    // Validate quantity against available stock
                    if (quantity > product.Quantity)
                    {
                        throw new InvalidOperationException($"Cannot update quantity to {quantity}. Only {product.Quantity} available in stock.");
                    }

                    cartItem.Quantity = quantity;
                    await _cartRepository.UpdateCartItemAsync(cartItem);
                }

                await _cartRepository.UpdateCartAsync(cart);
                var updatedCart = await _cartRepository.GetCartByUserIdAsync(customerId);
                return MapToCartModel(updatedCart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item quantity for user {CustomerId}, product {ProductId}", customerId, productId);
                throw;
            }
        }

        public async Task<CartModel> RemoveFromCartAsync(int customerId, int productId)
        {
            try
            {
                var cart = await _cartRepository.GetCartByUserIdAsync(customerId);
                if (cart == null)
                {
                    throw new InvalidOperationException("Cart not found for user");
                }

                var cartItem = await _cartRepository.GetCartItemAsync(cart.CartId, productId);
                if (cartItem != null)
                {
                    await _cartRepository.DeleteCartItemAsync(cartItem.CartItemId);
                    await _cartRepository.UpdateCartAsync(cart);
                }

                var updatedCart = await _cartRepository.GetCartByUserIdAsync(customerId);
                return MapToCartModel(updatedCart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing product {ProductId} from cart for user {CustomerId}", productId, customerId);
                throw;
            }
        }

        public async Task ClearUserCartAsync(int customerId)
        {
            try
            {
                var cart = await _cartRepository.GetCartByUserIdAsync(customerId);
                if (cart != null)
                {
                    await _cartRepository.ClearCartAsync(cart.CartId);
                    await _cartRepository.UpdateCartAsync(cart);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart for user {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<CartModel> SyncLocalCartToUserAsync(int customerId, List<CartItemModel> localCartItems)
        {
            try
            {
                var cart = await _cartRepository.GetCartByUserIdAsync(customerId);
                if (cart == null)
                {
                    cart = await _cartRepository.CreateCartAsync(customerId);
                }

                // Clear existing cart
                await _cartRepository.ClearCartAsync(cart.CartId);

                // Add local cart items
                foreach (var item in localCartItems)
                {
                    var cartItem = new CartItem
                    {
                        CartId = cart.CartId,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity
                    };
                    await _cartRepository.AddCartItemAsync(cartItem);
                }

                await _cartRepository.UpdateCartAsync(cart);
                var updatedCart = await _cartRepository.GetCartByUserIdAsync(customerId);
                return MapToCartModel(updatedCart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing local cart to user {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<List<CartItemModel>> GetCartItemsAsync(int customerId)
        {
            try
            {
                var cart = await _cartRepository.GetCartByUserIdAsync(customerId);
                if (cart == null)
                {
                    return new List<CartItemModel>();
                }

                return cart.CartItems.Select(ci => new CartItemModel
                {
                    ProductId = ci.ProductId,
                    Quantity = ci.Quantity
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart items for user {CustomerId}", customerId);
                throw;
            }
        }

        private CartModel MapToCartModel(Cart cart)
        {
            if (cart == null) return null;

            return new CartModel
            {
                CartId = cart.CartId,
                CustomerId = cart.CustomerId,
                CreatedAt = cart.CreatedAt,
                IsActive = cart.IsActive,
                CartItems = cart.CartItems?.Select(MapToCartItemResponseDto).ToList() ?? new List<CartItemResponseModel>()
            };
        }

        private CartItemResponseModel MapToCartItemResponseDto(CartItem cartItem)
        {
            return new CartItemResponseModel
            {
                CartItemId = cartItem.CartItemId,
                ProductId = cartItem.ProductId,
                Quantity = cartItem.Quantity,
                CreatedAt = cartItem.CreatedAt,
                Product = cartItem.Product != null ? MapToProductDto(cartItem.Product) : null
            };
        }

        private ProductModel MapToProductDto(Product product)
        {
            return new ProductModel
            {
                Id = product.PrdId,
                TitleEn = product.NameEn,
                TitleSv = product.NameSv,
                DescriptionEn = product.DescriptionEn,
                DescriptionSv = product.DescriptionSv,
                ImageUrl = "/uploads/products/" + product.ImageUrl,
                FromPrice = product.FromPrice,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                IsCarousel = product.IsCarousel,
                BadgeEn = product.BadgeEn,
                BadgeSv = product.BadgeSv
            };
        }
    }
}
