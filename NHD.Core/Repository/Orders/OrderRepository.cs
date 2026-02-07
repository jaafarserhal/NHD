using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NHD.Core.Common.Models;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Orders
{
    public class OrderRepository : Repository<Order>, IOrderRepository
    {
        public OrderRepository(AppDbContext context) : base(context)
        {
        }


        public async Task<Order> GetOrderByIdAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Prd)
                .Include(o => o.OrderStatusLookup)
                .Include(o => o.PaymentGateway)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task<PagedResult<Order>> GetOrdersByCustomerIdAsync(int customerId, int page, int limit)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Prd)
                .Include(o => o.OrderStatusLookup)
                .Include(o => o.PaymentGateway)
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.CreatedAt);

            var total = await query.CountAsync();

            var orders = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<Order>
            {
                Data = orders,
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<PagedResult<Order>> GetOrdersAsync(int page, int limit)
        {
            var query = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Prd)
                .Include(o => o.OrderStatusLookup)
                .Include(o => o.PaymentGateway)
                .OrderByDescending(o => o.CreatedAt);

            var total = await query.CountAsync();

            var orders = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PagedResult<Order>
            {
                Data = orders,
                Total = total,
                Page = page,
                Limit = limit
            };
        }
    }
}