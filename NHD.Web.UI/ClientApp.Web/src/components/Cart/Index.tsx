import React, { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import styles from "./index.module.css";
import { routeUrls } from "../../api/base/routeUrls";
import { useSystemPropertiesHelper } from '../../hooks/useSystemPropertiesHelper';

const Cart: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart();
    const { getCurrencySymbol } = useSystemPropertiesHelper();
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleQuantityUpdate = async (productId: number, newQuantity: number) => {
        try {
            await updateQuantity(productId, newQuantity);
            setErrorMessage(''); // Clear any previous errors
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to update quantity');
            // Show error for a few seconds then clear
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    return (
        <div className={`offcanvas offcanvas-end offcanvas-cart ${styles.cartCanvas}`} id="offcanvasCart">
            <div className={`offcanvas-header ${styles.offcanvasHeader}`}>
                <h4 className="offcanvas-title">Shopping Cart</h4>
                <button type="button" className="btn-close text-secondary" data-bs-dismiss="offcanvas">
                    <i className="lastudioicon lastudioicon-e-remove"></i>
                </button>
            </div>

            {errorMessage && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{ margin: '10px' }}>
                    <small>{errorMessage}</small>
                    <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                </div>
            )}

            <div className="offcanvas-body">
                {cartItems.length === 0 ? (
                    <div className="text-center py-4">
                        <i className="lastudioicon lastudioicon-shopping-cart" style={{ fontSize: '48px', color: '#ccc' }}></i>
                        <p className="mt-3 text-muted">Your cart is empty</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.addedItemsText}>
                            <p>Recently added item(s)</p>
                        </div>
                        <ul className="offcanvas-cart-items">
                            {cartItems.map((item) => (
                                <li key={item.product.id}>
                                    <div className="mini-cart-item">
                                        <button
                                            className="mini-cart-item__remove"
                                            onClick={() => removeFromCart(item.product.id)}
                                            type="button"
                                        >
                                            <i className="lastudioicon lastudioicon-e-remove"></i>
                                        </button>
                                        <div className="mini-cart-item__thumbnail">
                                            <a href={`/product/${item.product.id}/${item.product.titleEn.replace(/\s+/g, '-').toLowerCase()}`}>
                                                <img
                                                    width="55"
                                                    height="55"
                                                    src={`${process.env.REACT_APP_BASE_URL || ""}${item.product.imageUrl ?? "/assets/images/placeholder.png"}`}
                                                    alt={item.product.titleEn}
                                                />
                                            </a>
                                        </div>
                                        <div className="mini-cart-item__content">
                                            <h6 className="mini-cart-item__title">
                                                <a href={`/product/${item.product.id}/${item.product.titleEn.replace(/\s+/g, '-').toLowerCase()}`}>
                                                    {item.product.titleEn}
                                                </a>
                                            </h6>
                                            <div className="mb-1">
                                                <small className="text-muted">
                                                    {item.product.quantity > 0 ? (
                                                        item.product.quantity <= 5 ? (
                                                            <span className="text-warning">Only {item.product.quantity} left</span>
                                                        ) : (
                                                            <span className="text-success">{item.product.quantity} available</span>
                                                        )
                                                    ) : (
                                                        <span className="text-danger">Out of stock</span>
                                                    )}
                                                </small>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="quantity-controls d-flex align-items-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                                                        onClick={() => handleQuantityUpdate(item.product.id, item.quantity - 1)}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            padding: '0',
                                                            fontSize: '14px',
                                                            lineHeight: '1',
                                                            border: '1px solid #dee2e6'
                                                        }}
                                                    >
                                                        −
                                                    </button>
                                                    <span className="mx-2" style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                                                        onClick={() => handleQuantityUpdate(item.product.id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.product.quantity}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            padding: '0',
                                                            fontSize: '14px',
                                                            lineHeight: '1',
                                                            border: '1px solid #dee2e6',
                                                            opacity: item.quantity >= item.product.quantity ? 0.5 : 1
                                                        }}
                                                        title={item.quantity >= item.product.quantity ? `Only ${item.product.quantity} available` : 'Increase quantity'}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="mini-cart-item__price">
                                                    {getCurrencySymbol()} {((item.product.fromPrice || 0) * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            {cartItems.length > 0 && (
                <div className="offcanvas-footer d-flex flex-column gap-4">
                    <div className={styles.miniCartInfo}>
                        <span className={styles.itemCartCount}>{getTotalItems()} item in a cart</span>
                        <span className={styles.totalPrice}>{getCurrencySymbol()} {getTotalPrice().toFixed(2)}</span>
                    </div>

                    <div className="mini-cart-btn d-flex flex-column gap-2">
                        <a className="d-block btn btn-secondary btn-hover-primary" href={routeUrls.cart}>View cart</a>
                        <a className="d-block btn btn-secondary btn-hover-primary" href={routeUrls.checkout}>Checkout</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
