import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Order {
    id: number;
    orderNumber: string;
    date: string;
    status: string;
    total: string;
}

const OrdersTab: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock data - Replace with actual API call
    useEffect(() => {
        // Uncomment and replace with actual API call
        // fetchOrders();

        // Mock data for demonstration
        setOrders([
            {
                id: 1,
                orderNumber: '#10001',
                date: 'Aug 22, 2018',
                status: 'Pending',
                total: '$3000'
            },
            {
                id: 2,
                orderNumber: '#10002',
                date: 'July 22, 2018',
                status: 'Approved',
                total: '$200'
            },
            {
                id: 3,
                orderNumber: '#10003',
                date: 'June 12, 2017',
                status: 'On Hold',
                total: '$990'
            }
        ]);
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Replace with actual API call
            // const response = await orderService.getOrders();
            // setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (orderId: number) => {
        // Navigate to order details page
        navigate(`/order/${orderId}`);
    };

    const getStatusBadgeClass = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'Pending': 'badge-warning',
            'Approved': 'badge-success',
            'On Hold': 'badge-secondary',
            'Shipped': 'badge-info',
            'Delivered': 'badge-success',
            'Cancelled': 'badge-danger'
        };
        return statusMap[status] || 'badge-secondary';
    };

    if (loading) {
        return (
            <div className="tab-pane fade" id="orders" role="tabpanel">
                <div className="myaccount-content order">
                    <div className="text-center py-5">
                        <p>Loading orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="tab-pane fade" id="orders" role="tabpanel">
                <div className="myaccount-content order">
                    <div className="col-12">
                        <h3 className="border-bottom pb-1 mb-4">My Orders</h3>
                    </div>
                    <div className="text-center py-5">
                        <p className="mb-3">You haven't placed any orders yet.</p>
                        <button
                            className="btn btn-dark btn-primary-hover"
                            onClick={() => navigate('/products')}
                        >
                            Start Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane fade" id="orders" role="tabpanel">
            <div className="myaccount-content order">
                <div className="col-12">
                    <h3 className="border-bottom pb-1 mb-4">My Orders</h3>
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.orderNumber}</td>
                                    <td>{order.date}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td><strong>{order.total}</strong></td>
                                    <td>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleViewOrder(order.id);
                                            }}
                                            className="underlined-link"
                                        >
                                            <b>View</b>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrdersTab;