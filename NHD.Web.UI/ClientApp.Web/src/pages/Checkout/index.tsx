import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import Footer from '../../components/Common/Footer/Index';
import Header from '../../components/Common/Header/Index';
import { routeUrls } from '../../api/base/routeUrls';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
    const [imageLoaded, setImageLoaded] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        streetAddress: '',
        city: '',
        country: 'Lebanon',
        zipCode: '',
        stateProvince: '',
        phoneNumber: '+961',
        sameAddress: true,
        giftMessage: '',
        shippingMethod: 'regular'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        navigate(routeUrls.payment);
        // Handle payment processing
    };

    useEffect(() => {
        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, []);

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
                                <h1 className="breadcrumb_title">Checkout</h1>
                                <ul className="breadcrumb_list">
                                    <li>
                                        <a href="index.html">Home</a>
                                    </li>
                                    <li>Checkout</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Breadcrumb Section End */}
            <div className={styles.checkoutContainer}>
                <form className={styles.checkoutForm} onSubmit={handleSubmit}>
                    {/* Email Section */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Your Email Address</h2>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">
                                Email <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="customer@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Shipping Information</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="firstName">
                                    First Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="John"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="lastName">
                                    Last Name <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="streetAddress">
                                    Street Address <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="streetAddress"
                                    name="streetAddress"
                                    value={formData.streetAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter a location"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="city">
                                    City <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="City"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="country">
                                    Country <span className={styles.required}>*</span>
                                </label>
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Lebanon">Lebanon</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                    <option value="France">France</option>
                                    <option value="Germany">Germany</option>
                                    <option value="UAE">UAE</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="zipCode">
                                    Zip/Postal Code <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="zipCode"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleInputChange}
                                    placeholder="10001"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="stateProvince">State/Province</label>
                                <input
                                    type="text"
                                    id="stateProvince"
                                    name="stateProvince"
                                    value={formData.stateProvince}
                                    onChange={handleInputChange}
                                    placeholder="State/Province"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phoneNumber">
                                    Shipping Phone Number <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.phoneInputWrapper}>
                                    <div className={styles.phonePrefix}>
                                        <span>🇱🇧</span>
                                        <span>+961</span>
                                    </div>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={styles.infoText}>
                                    <span className={styles.infoIcon}>?</span>
                                    <span>Valid phone number with country code or destination country is required</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.checkboxWrapper}>
                            <input
                                type="checkbox"
                                id="sameAddress"
                                name="sameAddress"
                                checked={formData.sameAddress}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="sameAddress">My billing and shipping address are the same</label>
                        </div>
                    </div>

                    {/* Gift Message Section */}
                    <div className={styles.optionalSection}>
                        <div className={styles.optionalHeader}>
                            <h3>Order Notes (optional)</h3>
                            <span>+</span>
                        </div>
                    </div>

                    {/* Shipping Methods */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Shipping Methods</h2>
                        <div className={styles.shippingMethods}>
                            <label className={styles.shippingOption}>
                                <input
                                    type="radio"
                                    name="shippingMethod"
                                    value="regular"
                                    checked={formData.shippingMethod === 'regular'}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.shippingDetails}>
                                    <div className={styles.shippingName}>Regular Shipping (3 to 4 days)</div>
                                </div>
                                <div className={styles.shippingPrice}>$41.00</div>
                            </label>
                        </div>

                        <div className={styles.termsText}>
                            By placing an order, you agree to our <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Proceed to Payment
                        </button>
                    </div>
                </form>

                {/* Order Summary */}
                <aside className={styles.orderSummary}>
                    <div className={styles.summaryCard}>
                        <h2 className={styles.summaryTitle}>Summary</h2>

                        <div className={styles.productItem}>
                            <div className={styles.productImage}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>
                                    PRODUCT
                                </div>
                            </div>
                            <div className={styles.productDetails}>
                                <div className={styles.productName}>Signature Collection</div>
                                <div className={styles.productMeta}>Qty: 1</div>
                                <div className={styles.productPrice}>$48.00</div>
                            </div>
                        </div>

                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Shipping</span>
                            <span className={styles.summaryValue}>$41.00</span>
                        </div>
                        <div className={styles.shippingNote}>Regular Shipping (3 to 4 days)</div>

                        <div className={styles.summaryTotal}>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Total</span>
                                <span className={styles.summaryValue}>$89.00</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            <Footer isDark={true} />
        </>
    );
}