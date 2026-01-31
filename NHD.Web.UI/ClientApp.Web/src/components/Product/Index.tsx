import React, { useState } from "react";
import { ProductsWithGallery } from "../../api/common/Types";
import PromptModal from "../Common/PromptModal/Index";
import { useCart } from "../../contexts/CartContext";
import styles from "./index.module.css";

interface ProductProps {
    product: ProductsWithGallery;
    onQuickView?: (product: ProductsWithGallery) => void;
    isByCategory?: boolean;
    modalId?: string;
    urlPrefix?: string;
}
//product-item border text-center
const Product: React.FC<ProductProps> = ({ product, onQuickView, isByCategory, modalId, urlPrefix = '/product' }) => {
    console.log('Product quantity:', product);
    const { addToCart } = useCart();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();

        // Check if product is out of stock
        if (product.quantity === 0) {
            setErrorMessage('This item is currently out of stock');
            setShowErrorModal(true);
            return;
        }

        try {
            await addToCart(product);
            setShowSuccessModal(true);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to add item to cart');
            setShowErrorModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
    };

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };
    return (
        <div className={isByCategory ? 'col mb-50' : 'col-lg-4 col-md-6'}>
            <div className={`product-item ${isByCategory ? '' : 'border'} text-center`}>
                {product.badgeTextEn && <div className="product-item__badge">{product.badgeTextEn}</div>}
                <div className={`product-item__image ${isByCategory ? 'border w-100' : ''}`} >
                    <a href={`${urlPrefix}/${product.id}/${product.titleEn.replace(/\s+/g, '-').toLowerCase()}`}>
                        <img
                            width={500}
                            height={625}
                            src={`${(process.env.REACT_APP_BASE_URL || "")}${product.imageUrl ?? "/assets/images/placeholder.png"}`}
                            alt={product.titleEn}
                        />
                    </a>
                    {modalId && <ul className={`product-item__meta ${isByCategory ? '' : 'meta-middle'}`}>
                        <li className="product-item__meta-action">
                            <a
                                className="labtn-icon-quickview"
                                href="#"
                                data-bs-tooltip="tooltip"
                                data-bs-placement="top"
                                title="Quick View"
                                data-bs-toggle="modal"
                                data-bs-target={`#${modalId}`}
                                onClick={(e) => {
                                    e.preventDefault();

                                    onQuickView && onQuickView(product);
                                }}
                            />
                        </li>
                        <li className="product-item__meta-action">
                            <a
                                className={`labtn-icon-cart ${product.quantity === 0 ? 'disabled' : ''}`}
                                href="#"
                                onClick={product.quantity === 0 ? (e) => e.preventDefault() : handleAddToCart}
                                data-bs-tooltip="tooltip"
                                data-bs-placement="top"
                                title={product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                style={{
                                    opacity: product.quantity === 0 ? 0.5 : 1,
                                    cursor: product.quantity === 0 ? 'not-allowed' : 'pointer'
                                }}
                            />
                        </li>
                    </ul>}
                </div>

                <div className={`product-item__content ${isByCategory ? 'pt-5' : 'pb-3'}`}>
                    <h5 className="product-item__title">
                        <a href={`${urlPrefix}/${product.id}/${product.titleEn.replace(/\s+/g, '-').toLowerCase()}`}>{product.titleEn}</a>
                    </h5>
                    {(product.fromPrice || product.fromPrice !== 0) && <span className={`product-item__price ${isByCategory ? '' : 'fs-2'}`}>
                        ${product.fromPrice?.toFixed(2)}
                    </span>}
                    <div className="mt-2">
                        {product.quantity === 0 ? (
                            <small className="text-danger">Out of stock</small>
                        ) : product.quantity <= 5 ? (
                            <small className="text-warning">Only {product.quantity} left</small>
                        ) : (
                            <small className="text-success">In stock</small>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <PromptModal
                isOpen={showSuccessModal}
                onClose={handleCloseModal}
                className="success-modal"
            >
                <div className="text-center p-4">
                    <div className="success-icon mb-3">
                        <i className="lastudioicon lastudioicon-check-1" style={{ fontSize: '48px', color: '#28a745' }}></i>
                    </div>
                    <h4 className="success-title mb-3">Added To Cart Successfully!</h4>
                    <p className="success-message mb-4">
                        <strong>{product.titleEn}</strong> has been added to your cart.
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <button
                            className={`btn btn-outline-secondary ${styles.shoppingBtn} pointer-cursor`}
                            onClick={handleCloseModal}
                        >
                            Continue Shopping
                        </button>
                        <button
                            className={`btn btn-primary ${styles.shoppingBtn} pointer-cursor`}
                            onClick={() => {
                                handleCloseModal();
                                // Trigger cart offcanvas
                                const cartElement = document.getElementById('offcanvasCart');
                                if (cartElement) {
                                    try {
                                        // Try Bootstrap 5 method first
                                        if (typeof (window as any).bootstrap !== 'undefined' && (window as any).bootstrap.Offcanvas) {
                                            const bsOffcanvas = (window as any).bootstrap.Offcanvas.getInstance(cartElement) ||
                                                new (window as any).bootstrap.Offcanvas(cartElement);
                                            bsOffcanvas.show();
                                        } else {
                                            // Fallback: trigger using data attributes
                                            const button = document.createElement('button');
                                            button.setAttribute('data-bs-toggle', 'offcanvas');
                                            button.setAttribute('data-bs-target', '#offcanvasCart');
                                            button.style.display = 'none';
                                            document.body.appendChild(button);
                                            button.click();
                                            document.body.removeChild(button);
                                        }
                                    } catch (error) {
                                        console.error('Error opening cart:', error);
                                        // Final fallback: manually show the offcanvas
                                        cartElement.classList.add('show');
                                        cartElement.style.visibility = 'visible';
                                        const backdrop = document.querySelector('.offcanvas-backdrop');
                                        if (backdrop) {
                                            backdrop.classList.add('show');
                                        } else {
                                            const newBackdrop = document.createElement('div');
                                            newBackdrop.className = 'offcanvas-backdrop fade show';
                                            newBackdrop.onclick = () => {
                                                cartElement.classList.remove('show');
                                                cartElement.style.visibility = 'hidden';
                                                newBackdrop.remove();
                                            };
                                            document.body.appendChild(newBackdrop);
                                        }
                                    }
                                }
                            }}
                        >
                            View Cart
                        </button>
                    </div>
                </div>
            </PromptModal>

            {/* Error Modal */}
            <PromptModal
                isOpen={showErrorModal}
                onClose={handleCloseErrorModal}
                id={`errorModal-${product.id}`}
            >
                <div className="modal-header">
                    <h4 className="modal-title">Unable to Add Item</h4>
                </div>
                <div className="modal-body">
                    <p>{errorMessage}</p>
                </div>
                <div className="modal-footer">
                    <div className="d-flex justify-content-center w-100">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCloseErrorModal}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </PromptModal>
        </div>
    );
};

export default Product;