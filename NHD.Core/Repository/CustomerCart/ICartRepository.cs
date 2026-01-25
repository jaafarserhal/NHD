using NHD.Core.Models;

namespace NHD.Core.Repository.CustomerCart
{
    public interface ICartRepository
    {
        Task<Cart> GetCartByUserIdAsync(int userId);
        Task<Cart> CreateCartAsync(int userId);
        Task<Cart> UpdateCartAsync(Cart cart);
        Task DeleteCartAsync(int cartId);
        Task<CartItem?> GetCartItemAsync(int cartId, int productId);
        Task<CartItem> AddCartItemAsync(CartItem cartItem);
        Task<CartItem> UpdateCartItemAsync(CartItem cartItem);
        Task DeleteCartItemAsync(int cartItemId);
        Task ClearCartAsync(int cartId);
        Task<List<CartItem>> GetCartItemsAsync(int cartId);
    }
}