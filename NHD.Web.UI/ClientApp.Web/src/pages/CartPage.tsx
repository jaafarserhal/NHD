import React, { useEffect, useState } from "react";
import Loader from "../components/Common/Loader/Index";
import Header from "../components/Common/Header/Index";
import Footer from "../components/Common/Footer/Index";
import { useCart } from "../contexts/CartContext";

const CartPage: React.FC = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { cartItems, isLoading, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();
    console.log("Cart Items:", cartItems);
    // preload image
    useEffect(() => {
        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, []);

    const handleQuantityUpdate = async (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        // Find the product to check stock
        const cartItem = cartItems.find(item => item.product.id === productId);
        if (cartItem && newQuantity > cartItem.product.quantity) {
            setErrorMessage(`Cannot update quantity to ${newQuantity}. Only ${cartItem.product.quantity} available in stock.`);
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        }

        try {
            await updateQuantity(productId, newQuantity);
            setErrorMessage(''); // Clear any previous errors
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to update quantity');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleRemoveItem = async (productId: number) => {
        try {
            await removeFromCart(productId);
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    return (
        <>
            <Loader loading={isLoading} />
            <Header />
            <div
                className="breadcrumb"
                style={{
                    backgroundImage:
                        "url(/assets/images/banner/contact-us-banner.webp)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: imageLoaded ? 1 : 0.9,
                    transition: "opacity 0.3s ease-in-out"
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb_content">
                                <h1 className="breadcrumb_title">Cart</h1>
                                <ul className="breadcrumb_list">
                                    <li>
                                        <a href="index.html">Home</a>
                                    </li>
                                    <li>Shopping Cart</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Breadcrumb Section End */}

            {errorMessage && (
                <div className="container mt-3">
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {errorMessage}
                        <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                    </div>
                </div>
            )}

            {/* Shop Cart Section Start */}
            <div className="section section-padding-03">
                <div className="container custom-container">
                    <div className="row mb-n30">
                        <div className="col-lg-8 col-12 mb-30">
                            {/* Cart Table For Tablet & Up Devices */}
                            <div className="table-responsive">
                                <table className="cart-table table text-center align-middle mb-6 d-none d-md-table">
                                    <thead>
                                        <tr>
                                            <th />
                                            <th />
                                            <th className="title text-start">Product</th>
                                            <th className="price">Price</th>
                                            <th className="quantity">Quantity</th>
                                            <th className="total">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {cartItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-5">
                                                    <p className="mb-0">Your cart is empty</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            cartItems.map((item) => (
                                                <tr key={item.product.id}>
                                                    <th className="cart-remove">
                                                        <button
                                                            className="remove-btn"
                                                            onClick={() => handleRemoveItem(item.product.id)}
                                                            disabled={isLoading}
                                                        >
                                                            <i className="lastudioicon lastudioicon-e-remove" />
                                                        </button>
                                                    </th>
                                                    <th className="cart-thumb">
                                                        <a href={`/product/${item.product.id}`}>
                                                            <img
                                                                src={`${process.env.REACT_APP_BASE_URL || ""}${item.product.imageUrl ?? "/assets/images/placeholder.png"}`}
                                                                alt={item.product.titleEn}
                                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                            />
                                                        </a>
                                                    </th>
                                                    <th className="text-start">
                                                        <a href={`/product/${item.product.id}`}>
                                                            {item.product.titleEn}
                                                        </a>
                                                        <div className="mt-1">
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
                                                    </th>
                                                    <td>${item.product.fromPrice?.toFixed(2) || '0.00'}</td>
                                                    <td className="text-center cart-quantity">
                                                        <div className="quantity">
                                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                                                                    onClick={() => handleQuantityUpdate(item.product.id, item.quantity - 1)}
                                                                    disabled={isLoading || item.quantity <= 1}
                                                                    style={{
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        padding: '0',
                                                                        fontSize: '16px',
                                                                        lineHeight: '1',
                                                                        border: '1px solid #dee2e6'
                                                                    }}
                                                                >
                                                                    −
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    min="1"
                                                                    max={item.product.quantity}
                                                                    onChange={(e) => handleQuantityUpdate(item.product.id, parseInt(e.target.value) || 1)}
                                                                    disabled={isLoading}
                                                                    style={{ width: '60px', textAlign: 'center', border: '1px solid #dee2e6' }}
                                                                />
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                                                                    onClick={() => handleQuantityUpdate(item.product.id, item.quantity + 1)}
                                                                    disabled={isLoading || item.quantity >= item.product.quantity}
                                                                    style={{
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        padding: '0',
                                                                        fontSize: '16px',
                                                                        lineHeight: '1',
                                                                        border: '1px solid #dee2e6',
                                                                        opacity: item.quantity >= item.product.quantity ? 0.5 : 1
                                                                    }}
                                                                    title={item.quantity >= item.product.quantity ? `Only ${item.product.quantity} available` : 'Increase quantity'}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${((item.product.fromPrice || 0) * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cart Table For Mobile Devices */}
                            <div className="cart-products-mobile d-md-none">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-5">
                                        <p className="mb-0">Your cart is empty</p>
                                    </div>
                                ) : (
                                    cartItems.map((item) => (
                                        <div key={item.product.id} className="cart-product-mobile">
                                            <div className="cart-product-mobile-thumb">
                                                <a
                                                    href={`/product/${item.product.id}`}
                                                    className="cart-product-mobile-image"
                                                >
                                                    <img
                                                        src={item.product.galleries?.[0]?.imageUrl || "/assets/images/product/product-tab-1.png"}
                                                        alt={item.product.titleEn}
                                                        width={90}
                                                        height={103}
                                                    />
                                                </a>
                                                <button
                                                    className="cart-product-mobile-remove"
                                                    onClick={() => handleRemoveItem(item.product.id)}
                                                    disabled={isLoading}
                                                >
                                                    <i className="lastudioicon lastudioicon-e-remove" />
                                                </button>
                                            </div>

                                            <div className="cart-product-mobile-content">
                                                <h5 className="cart-product-mobile-title">
                                                    <a href={`/product/${item.product.id}`}>
                                                        {item.product.titleEn}
                                                    </a>
                                                </h5>
                                                <div className="mb-2">
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
                                                <span className="cart-product-mobile-quantity">
                                                    {item.quantity} x ${item.product.fromPrice?.toFixed(2) || '0.00'}
                                                </span>
                                                <span className="cart-product-mobile-total">
                                                    <b>Total:</b> ${((item.product.fromPrice || 0) * item.quantity).toFixed(2)}
                                                </span>
                                                <div className="quantity">
                                                    <div className="d-flex align-items-center gap-2 mt-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                                                            onClick={() => handleQuantityUpdate(item.product.id, item.quantity - 1)}
                                                            disabled={isLoading || item.quantity <= 1}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                padding: '0',
                                                                fontSize: '16px',
                                                                lineHeight: '1',
                                                                border: '1px solid #dee2e6'
                                                            }}
                                                        >
                                                            −
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            min="1"
                                                            max={item.product.quantity}
                                                            onChange={(e) => handleQuantityUpdate(item.product.id, parseInt(e.target.value) || 1)}
                                                            disabled={isLoading}
                                                            style={{ width: '60px', textAlign: 'center', border: '1px solid #dee2e6' }}
                                                        />
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                                                            onClick={() => handleQuantityUpdate(item.product.id, item.quantity + 1)}
                                                            disabled={isLoading || item.quantity >= item.product.quantity}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                padding: '0',
                                                                fontSize: '16px',
                                                                lineHeight: '1',
                                                                border: '1px solid #dee2e6',
                                                                opacity: item.quantity >= item.product.quantity ? 0.5 : 1
                                                            }}
                                                            title={item.quantity >= item.product.quantity ? `Only ${item.product.quantity} available` : 'Increase quantity'}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Cart Action Buttons */}
                            <div className="row justify-content-between gap-3">
                                <div className="col-auto">
                                    <button
                                        className="btn btn-outline-dark btn-primary-hover rounded-0"
                                        onClick={() => window.location.href = '/shop'}
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                                <div className="col-auto d-flex flex-wrap gap-3">
                                    <button
                                        className="btn btn-outline-dark btn-primary-hover rounded-0"
                                        onClick={handleClearCart}
                                        disabled={isLoading || cartItems.length === 0}
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cart Totals */}
                        <div className="col-lg-4 col-12 mb-30">
                            <div className="cart-totals">
                                <div className="cart-totals-inner">
                                    <h4 className="title">Cart totals</h4>
                                    <table className="table bg-transparent">
                                        <tbody>
                                            <tr className="subtotal">
                                                <th className="sub-title">Subtotal</th>
                                                <td className="amount">
                                                    <span>${getTotalPrice().toFixed(2)}</span>
                                                </td>
                                            </tr>
                                            <tr className="total">
                                                <th className="sub-title">Total</th>
                                                <td className="amount">
                                                    <strong>${getTotalPrice().toFixed(2)}</strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    className="btn btn-dark btn-hover-primary rounded-0 w-100"
                                    disabled={cartItems.length === 0 || isLoading}
                                    onClick={() => window.location.href = '/checkout'}
                                >
                                    Proceed to checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Shop Cart Section End */}
            <Footer isDark />
        </>
    );
};

export default CartPage;
