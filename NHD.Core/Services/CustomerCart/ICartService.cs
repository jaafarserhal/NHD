using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Services.Model.CustomerCart;

namespace NHD.Core.Services.CustomerCart
{
    public interface ICartService
    {
        Task<Cart?> GetUserCartAsync(int customerId);
        Task<ServiceResult<CartModel>> GetUserCartModelAsync(int customerId);
        Task<CartModel> AddToCartAsync(int customerId, int productId, int quantity = 1);
        Task<CartModel> UpdateCartItemQuantityAsync(int customerId, int productId, int quantity);
        Task<CartModel> RemoveFromCartAsync(int customerId, int productId);
        Task ClearUserCartAsync(int customerId);
        Task<CartModel> SyncLocalCartToUserAsync(int customerId, List<CartItemModel> localCartItems);
        Task<List<CartItemModel>> GetCartItemsAsync(int customerId);
        Task<int> GetCustomerIdByEmail(string email);
    }
}