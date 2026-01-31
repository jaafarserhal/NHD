import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import Footer from '../../components/Common/Footer/Index';
import Header from '../../components/Common/Header/Index';

export default function Payment() {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('visa');

    useEffect(() => {
        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, []);

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Payment submitted:', paymentMethod);
        // Handle payment processing
    };

    return (
        <>
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
                                <h1 className="breadcrumb_title">Payment</h1>
                                <ul className="breadcrumb_list">
                                    <li>
                                        <a href="index.html">Home</a>
                                    </li>
                                    <li>Payment</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.paymentContainer}>
                <div className={styles.paymentContent}>
                    {/* Shipping Information Section */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoCard}>
                            <h2 className={styles.sectionTitle}>SHIPPING INFORMATION</h2>
                            <div className={styles.addressesContainer}>
                                <div className={styles.addressBlock}>
                                    <div className={styles.addressContent}>
                                        <div className={styles.addressName}>Jaafar Serhal</div>
                                        <div className={styles.addressLine}>Main Street</div>
                                        <div className={styles.addressLine}>Limhamn, 21647</div>
                                        <div className={styles.addressLine}>Lebanon</div>
                                        <div className={styles.addressLine}>+961 3069781</div>
                                        <div className={styles.shippingMethod}>Regular Shipping (3 to 5 days)</div>
                                    </div>
                                    <button className={styles.editButton}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.419 1.44775 12.6663 1.44775C12.9137 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08608 14.552 3.33337C14.552 3.58066 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={styles.addressBlock}>
                                    <div className={styles.addressContent}>
                                        <div className={styles.blockTitle}>Billing Address</div>
                                        <div className={styles.addressName}>Jaafar Serhal</div>
                                        <div className={styles.addressLine}>Main Street</div>
                                        <div className={styles.addressLine}>Limhamn, 21647</div>
                                        <div className={styles.addressLine}>Lebanon</div>
                                        <div className={styles.addressLine}>+961 3069781</div>
                                    </div>
                                    <button className={styles.editButton}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.419 1.44775 12.6663 1.44775C12.9137 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08608 14.552 3.33337C14.552 3.58066 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Section */}
                    <div className={styles.paymentSection}>
                        <form onSubmit={handlePaymentSubmit} className={styles.paymentForm}>
                            <h2 className={styles.sectionTitle}>PAYMENT METHOD</h2>
                            <div className={styles.paymentMethods}>
                                <label className={styles.paymentOption}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="visa"
                                        checked={paymentMethod === 'visa'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className={styles.radioLabel}>Visa/Master Card accepted</span>
                                </label>

                                <label className={styles.paymentOption}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={paymentMethod === 'paypal'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className={styles.paypalOption}>
                                        <img src="/assets/images/payment/paypal.png" alt="PayPal" className={styles.paypalLogo} />
                                        <span className={styles.radioLabel}>PayPal Express Checkout</span>
                                        <a href="#" className={styles.paypalLink}>What is Paypal?</a>
                                    </div>
                                </label>

                                <label className={styles.paymentOption}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="amex"
                                        checked={paymentMethod === 'amex'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className={styles.amexOption}>
                                        <span className={styles.radioLabel}>Amex Card</span>
                                        <img src="/assets/images/payment/amex.png" alt="American Express" className={styles.amexLogo} />
                                    </div>
                                </label>

                                <label className={styles.paymentOption}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="google"
                                        checked={paymentMethod === 'google'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className={styles.radioLabel}>Google Pay</span>
                                </label>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <aside className={styles.orderSummary}>
                    <div className={styles.summaryCard}>
                        <h2 className={styles.summaryTitle}>SUMMARY</h2>

                        <div className={styles.productItem}>
                            <div className={styles.productImage}>
                                <img src="/assets/images/product/signature-collection.jpg" alt="Signature Collection" />
                            </div>
                            <div className={styles.productDetails}>
                                <div className={styles.productName}>Signature Collection</div>
                                <div className={styles.productMeta}>Qty: 1</div>
                                <div className={styles.productPrice}>$66.00</div>
                            </div>
                        </div>

                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Cart Subtotal (VAT included)</span>
                            <span className={styles.summaryValue}>$66.00</span>
                        </div>

                        <div className={styles.discountSection}>
                            <div className={styles.discountHeader}>DISCOUNT</div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}></span>
                                <span className={styles.summaryValue}>-$6.60</span>
                            </div>
                        </div>

                        <div className={styles.summaryRow}>
                            <div>
                                <div className={styles.summaryLabel}>Shipping</div>
                                <div className={styles.shippingNote}>Regular Shipping (3 to 5 days)</div>
                            </div>
                            <span className={styles.summaryValue}>$41.00</span>
                        </div>

                        <div className={styles.summaryTotal}>
                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Order Total</span>
                                <span className={styles.totalValue}>$100.40</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            <Footer isDark={true} />
        </>
    );
}