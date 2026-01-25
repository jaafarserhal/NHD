using Microsoft.EntityFrameworkCore;
using NHD.Core.Data;
using NHD.Core.Models;

namespace NHD.Core.Repository.CustomerCart
{
    public class CartRepository : ICartRepository
    {
        private readonly AppDbContext _context;

        public CartRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Cart> GetCartByUserIdAsync(int userId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                        .ThenInclude(p => p.Galleries)
                .FirstOrDefaultAsync(c => c.CustomerId == userId);
        }

        public async Task<Cart> CreateCartAsync(int userId)
        {
            var cart = new Cart
            {
                CustomerId = userId,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
            return cart;
        }

        public async Task<Cart> UpdateCartAsync(Cart cart)
        {
            _context.Carts.Update(cart);
            await _context.SaveChangesAsync();
            return cart;
        }

        public async Task DeleteCartAsync(int cartId)
        {
            var cart = await _context.Carts.FindAsync(cartId);
            if (cart != null)
            {
                _context.Carts.Remove(cart);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<CartItem?> GetCartItemAsync(int cartId, int productId)
        {
            return await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.ProductId == productId);
        }

        public async Task<CartItem> AddCartItemAsync(CartItem cartItem)
        {
            cartItem.CreatedAt = DateTime.UtcNow;

            _context.CartItems.Add(cartItem);
            await _context.SaveChangesAsync();
            return cartItem;
        }

        public async Task<CartItem> UpdateCartItemAsync(CartItem cartItem)
        {
            _context.CartItems.Update(cartItem);
            await _context.SaveChangesAsync();
            return cartItem;
        }

        public async Task DeleteCartItemAsync(int cartItemId)
        {
            var cartItem = await _context.CartItems.FindAsync(cartItemId);
            if (cartItem != null)
            {
                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ClearCartAsync(int cartId)
        {
            var cartItems = await _context.CartItems
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
        }

        public async Task<List<CartItem>> GetCartItemsAsync(int cartId)
        {
            return await _context.CartItems
                .Include(ci => ci.Product)
                    .ThenInclude(p => p.Galleries)
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();
        }
    }
}