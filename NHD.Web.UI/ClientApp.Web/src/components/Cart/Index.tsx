import React from "react";
import { useCart } from "../../contexts/CartContext";
import styles from "./index.module.css";

const Cart: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart();

    return (
        <div className={`offcanvas offcanvas-end offcanvas-cart ${styles.cartCanvas}`} id="offcanvasCart">
            <div className={`offcanvas-header ${styles.offcanvasHeader}`}>
                <h4 className="offcanvas-title">Shopping Cart</h4>
                <button type="button" className="btn-close text-secondary" data-bs-dismiss="offcanvas">
                    <i className="lastudioicon lastudioicon-e-remove"></i>
                </button>
            </div>

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
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="quantity-controls d-flex align-items-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
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
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            padding: '0',
                                                            fontSize: '14px',
                                                            lineHeight: '1',
                                                            border: '1px solid #dee2e6'
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="mini-cart-item__price">
                                                    ${((item.product.fromPrice || 0) * item.quantity).toFixed(2)}
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
                        <span className={styles.totalPrice}>${getTotalPrice().toFixed(2)}</span>
                    </div>

                    <div className="mini-cart-btn d-flex flex-column gap-2">
                        <a className="d-block btn btn-secondary btn-hover-primary" href="#">View cart</a>
                        <a className="d-block btn btn-secondary btn-hover-primary" href="#">Checkout</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
