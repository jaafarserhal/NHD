import React from "react";

const Cart: React.FC = () => {
    return (
        <div className="offcanvas offcanvas-end offcanvas-cart" id="offcanvasCart">
            <div className="offcanvas-header">
                <h4 className="offcanvas-title">My Cart</h4>
                <button type="button" className="btn-close text-secondary" data-bs-dismiss="offcanvas">
                    <i className="lastudioicon lastudioicon-e-remove"></i>
                </button>
            </div>

            <div className="offcanvas-body">
                <ul className="offcanvas-cart-items">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <li key={i}>
                            <div className="mini-cart-item">
                                <a href="#/" className="mini-cart-item__remove">
                                    <i className="lastudioicon lastudioicon-e-remove"></i>
                                </a>
                                <div className="mini-cart-item__thumbnail">
                                    <a href="single-product.html">
                                        <img width="70" height="88" src={`/assets/images/mini-cart/cart-${i}.png`} alt="Cart" />
                                    </a>
                                </div>
                                <div className="mini-cart-item__content">
                                    <h6 className="mini-cart-item__title">
                                        <a href="single-product.html">Product {i}</a>
                                    </h6>
                                    <span className="mini-cart-item__quantity">1 × $4.99</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="offcanvas-footer d-flex flex-column gap-4">
                <div className="mini-cart-totla">
                    <span className="label">Subtotal:</span>
                    <span className="value">$24.95</span>
                </div>

                <div className="mini-cart-btn d-flex flex-column gap-2">
                    <a className="d-block btn btn-secondary btn-hover-primary" href="#">View cart</a>
                    <a className="d-block btn btn-secondary btn-hover-primary" href="#">Checkout</a>
                </div>
            </div>
        </div>
    );
};

export default Cart;
