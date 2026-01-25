using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NHD.Core.Common.Models;
using NHD.Core.Services.CustomerCart;
using NHD.Core.Services.Model.CustomerCart;
using System.Security.Claims;

namespace NHD.Web.UI.Controllers.Website
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;

        public CartController(ICartService cartService, ILogger<CartController> logger)
        {
            _cartService = cartService ?? throw new ArgumentNullException(nameof(cartService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        private async Task<int> GetCustomerId()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null)
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }
            return email != null ? await _cartService.GetCustomerIdByEmail(email) : 0;
        }


        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ServiceResult<CartModel>>> GetCart()
        {
            try
            {
                var customerId = await GetCustomerId();
                var data = await _cartService.GetUserCartModelAsync(customerId);
                if (data.IsSuccess)
                    return Ok(data);

                return BadRequest(data);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("add")]
        [Authorize]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            try
            {
                var customerId = await GetCustomerId();
                var cart = await _cartService.AddToCartAsync(customerId, request.ProductId, request.Quantity);
                return Ok(cart);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to cart");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateQuantity([FromBody] UpdateCartItemRequest request)
        {
            try
            {
                var customerId = await GetCustomerId();
                var cart = await _cartService.UpdateCartItemQuantityAsync(customerId, request.ProductId, request.Quantity);
                return Ok(cart);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("remove/{productId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            try
            {
                var customerId = await GetCustomerId();
                var cart = await _cartService.RemoveFromCartAsync(customerId, productId);
                return Ok(cart);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from cart");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("clear")]
        [Authorize]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                var customerId = await GetCustomerId();
                await _cartService.ClearUserCartAsync(customerId);
                return Ok(new { message = "Cart cleared successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("sync")]
        [Authorize]
        public async Task<IActionResult> SyncLocalCart([FromBody] SyncCartRequest request)
        {
            try
            {
                var customerId = await GetCustomerId();
                var cart = await _cartService.SyncLocalCartToUserAsync(customerId, request.CartItems);
                return Ok(cart);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing cart");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}