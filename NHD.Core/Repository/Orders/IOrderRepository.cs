using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NHD.Core.Common.Models;
using NHD.Core.Models;
using NHD.Core.Repository.Base;

namespace NHD.Core.Repository.Orders
{
    public interface IOrderRepository : IRepository<Order>
    {
        Task<Order> GetOrderByIdAsync(int orderId);
        Task<PagedResult<Order>> GetOrdersByCustomerIdAsync(int customerId, int page, int limit);
        Task<PagedResult<Order>> GetOrdersAsync(int page, int limit);
    }
}