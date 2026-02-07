import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import Footer from '../../components/Common/Footer/Index';
import Header from '../../components/Common/Header/Index';
import { routeUrls } from '../../api/base/routeUrls';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../api/base/storage';
import FormField from '../../components/Common/FormField/Index';
import { AddressTypeEnum } from '../../api/common/Enums';
import { useCart } from '../../contexts/CartContext';
import authService from '../../api/authService';
import Loader from '../../components/Common/Loader/Index';

export default function Checkout() {
    const [imageLoaded, setImageLoaded] = useState(false);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showOrderNote, setShowOrderNote] = useState(false);
    const { cartItems, getTotalPrice, clearCart } = useCart();
    const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [cartInitialized, setCartInitialized] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Calculate summary values
    const shippingCost = 41.00;
    const subtotal = getTotalPrice();
    const totalAmount = subtotal + shippingCost;
    const [formData, setFormData] = useState({
        email: "",
        note: "",
    });

    const [shippingData, setShippingData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        streetName: "",
        streetNumber: "",
        postalCode: "",
        city: "",
    });

    const [billingData, setBillingData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        streetName: "",
        streetNumber: "",
        postalCode: "",
        city: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        // Handle billing form fields
        if (name.startsWith('billing_')) {
            const billingFieldName = name.replace('billing_', '');
            setBillingData(prev => ({
                ...prev,
                [billingFieldName]: value
            }));
        }
        // Handle shipping form fields
        else if (['firstName', 'lastName', 'phone', 'streetName', 'streetNumber', 'postalCode', 'city'].includes(name)) {
            setShippingData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        // Handle general form fields (email, note) and checkboxes
        else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        if (name === "sameAddress") {
            setIsBillingSameAsShipping(checked);
        }

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const validationErrors: { [key: string]: string } = {};

        if (!isLoggedIn) {
            // Shipping validation
            if (!formData.email?.trim()) validationErrors.email = "Email is required";
            if (!shippingData.firstName?.trim()) validationErrors.firstName = "First name is required";
            if (!shippingData.lastName?.trim()) validationErrors.lastName = "Last name is required";
            if (!shippingData.streetName?.trim()) validationErrors.streetName = "Street name is required";
            if (!shippingData.streetNumber?.trim()) validationErrors.streetNumber = "Street number is required";
            if (!shippingData.postalCode?.trim()) validationErrors.postalCode = "Postal code is required";
            if (!shippingData.city?.trim()) validationErrors.city = "City is required";
            if (!shippingData.phone?.trim()) validationErrors.phone = "Phone number is required";

            // Billing validation when separate billing is enabled
            if (!isBillingSameAsShipping) {
                if (!billingData.firstName?.trim()) validationErrors.billing_firstName = "Billing first name is required";
                if (!billingData.lastName?.trim()) validationErrors.billing_lastName = "Billing last name is required";
                if (!billingData.streetName?.trim()) validationErrors.billing_streetName = "Billing street name is required";
                if (!billingData.streetNumber?.trim()) validationErrors.billing_streetNumber = "Billing street number is required";
                if (!billingData.postalCode?.trim()) validationErrors.billing_postalCode = "Billing postal code is required";
                if (!billingData.city?.trim()) validationErrors.billing_city = "Billing city is required";
                if (!billingData.phone?.trim()) validationErrors.billing_phone = "Billing phone number is required";
            }
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Prepare guest checkout data according to the API structure
            const guestCheckoutData = {
                email: formData.email,
                shipping: {
                    firstName: shippingData.firstName,
                    lastName: shippingData.lastName,
                    phone: shippingData.phone,
                    streetName: shippingData.streetName,
                    streetNumber: shippingData.streetNumber,
                    postalCode: shippingData.postalCode,
                    city: shippingData.city,
                    typeId: AddressTypeEnum.Shipping
                },
                billing: isBillingSameAsShipping ? {
                    firstName: shippingData.firstName,
                    lastName: shippingData.lastName,
                    phone: shippingData.phone,
                    streetName: shippingData.streetName,
                    streetNumber: shippingData.streetNumber,
                    postalCode: shippingData.postalCode,
                    city: shippingData.city,
                    typeId: AddressTypeEnum.Billing
                } : {
                    firstName: billingData.firstName,
                    lastName: billingData.lastName,
                    phone: billingData.phone,
                    streetName: billingData.streetName,
                    streetNumber: billingData.streetNumber,
                    postalCode: billingData.postalCode,
                    city: billingData.city,
                    typeId: AddressTypeEnum.Billing
                },
                items: cartItems.map(item => ({
                    productId: item.product.id,
                    price: item.product.fromPrice,
                    quantity: item.quantity
                })),
                totalPrice: totalAmount,
                note: formData.note || "",
                isBillingSameAsShipping: isBillingSameAsShipping
            };

            const response = await authService.placeOrderAsGuest(guestCheckoutData);

            if (response && response.data) {
                setTimeout(() => {
                    setIsLoading(false);
                    clearCart();
                    setOrderPlaced(true);
                }, 2000);
            } else {
                throw new Error('Failed to place order as guest. Please try again.');
            }

        } catch (error: any) {
            setIsLoading(false);
            let errorMessage = 'An error occurred during checkout. Please try again.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = 'Please check your information and try again.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            console.error('Error during checkout:', errorMessage);
        }
    };


    useEffect(() => {
        // Check authentication status
        const token = storage.get('webAuthToken');
        setIsLoggedIn(!!token);

        // Mark cart as initialized after first render
        if (!cartInitialized) {
            setCartInitialized(true);
            return;
        }

        // Redirect to cart if no items (only after cart is initialized and order hasn't been placed)
        if (cartInitialized && cartItems.length === 0 && !orderPlaced) {
            navigate(routeUrls.cart);
            return;
        }

        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, [cartItems.length, navigate, cartInitialized]);

    // Thank you message component
    const ThankYouMessage = () => (
        <div className={styles.thankYouOverlay}>
            <div className={styles.thankYouCard}>
                <div className={styles.thankYouIcon}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#10B981" fillOpacity="0.1" />
                        <path d="M8 12L11 15L16 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h2 className={styles.thankYouTitle}>Thank You for Your Order!</h2>
                <p className={styles.thankYouMessage}>
                    Your order has been successfully placed. We'll send you a confirmation email shortly with your order details.
                </p>
                <button
                    className={styles.homeButton}
                    onClick={() => navigate(routeUrls.home)}
                >
                    Go Home
                </button>
            </div>
        </div>
    );

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
                                        <a href="/">Home</a>
                                    </li>
                                    <li>Checkout</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Breadcrumb Section End */}
            {orderPlaced && <ThankYouMessage />}
            <div className={styles.checkoutContainer}>
                <Loader loading={isLoading} fullscreen={false} isDark={true} />
                <form className={styles.checkoutForm} onSubmit={handleSubmit}>
                    {/* Email Section */}
                    {!isLoggedIn && (
                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>Your Email Address</h2>
                            <div className={styles.formGroup}>
                                <FormField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    error={errors.email}
                                    onChange={handleInputChange}
                                    placeholder="customer@example.com"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Shipping Information */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Shipping Information</h2>

                        {isLoggedIn ? (
                            <p className={styles.loggedInMessage}>
                                Welcome back! Your saved address information will be used for this order.
                            </p>
                        ) : (
                            <>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <FormField
                                            label="First Name"
                                            name="firstName"
                                            value={shippingData.firstName}
                                            error={errors.firstName}
                                            onChange={handleInputChange}
                                            placeholder="John"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <FormField
                                            label="Last Name"
                                            name="lastName"
                                            value={shippingData.lastName}
                                            error={errors.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <FormField
                                            label="Street Name"
                                            name="streetName"
                                            value={shippingData.streetName}
                                            error={errors.streetName}
                                            onChange={handleInputChange}
                                            placeholder="Enter street name"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <FormField
                                            label="Street Number"
                                            name="streetNumber"
                                            value={shippingData.streetNumber}
                                            error={errors.streetNumber}
                                            onChange={handleInputChange}
                                            placeholder="Enter street number"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <FormField
                                            label="City"
                                            name="city"
                                            value={shippingData.city}
                                            error={errors.city}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <FormField
                                            label="Postal Code"
                                            name="postalCode"
                                            value={shippingData.postalCode}
                                            error={errors.postalCode}
                                            onChange={handleInputChange}
                                            placeholder="10001"
                                            maxLength={5}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <FormField
                                            label="Phone Number"
                                            name="phone"
                                            type="tel"
                                            value={shippingData.phone}
                                            error={errors.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.checkboxWrapper}>
                                    <input
                                        type="checkbox"
                                        id="sameAddress"
                                        name="sameAddress"
                                        checked={isBillingSameAsShipping}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="sameAddress">My billing and shipping address are the same</label>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Billing Information - Show only when not logged in and billing is different */}
                    {!isLoggedIn && !isBillingSameAsShipping && (
                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>Billing Information</h2>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <FormField
                                        label="First Name"
                                        name="billing_firstName"
                                        value={billingData.firstName}
                                        error={errors.billing_firstName}
                                        onChange={handleInputChange}
                                        placeholder="John"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <FormField
                                        label="Last Name"
                                        name="billing_lastName"
                                        value={billingData.lastName}
                                        error={errors.billing_lastName}
                                        onChange={handleInputChange}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <FormField
                                        label="Street Name"
                                        name="billing_streetName"
                                        value={billingData.streetName}
                                        error={errors.billing_streetName}
                                        onChange={handleInputChange}
                                        placeholder="Enter street name"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <FormField
                                        label="Street Number"
                                        name="billing_streetNumber"
                                        value={billingData.streetNumber}
                                        error={errors.billing_streetNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter street number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <FormField
                                        label="City"
                                        name="billing_city"
                                        value={billingData.city}
                                        error={errors.billing_city}
                                        onChange={handleInputChange}
                                        placeholder="City"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <FormField
                                        label="Postal Code"
                                        name="billing_postalCode"
                                        value={billingData.postalCode}
                                        error={errors.billing_postalCode}
                                        onChange={handleInputChange}
                                        placeholder="10001"
                                        maxLength={5}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <FormField
                                        label="Phone Number"
                                        name="billing_phone"
                                        type="tel"
                                        value={billingData.phone}
                                        error={errors.billing_phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gift Message Section */}
                    <div className={styles.optionalSection}>
                        <div
                            className={styles.optionalHeader}
                            onClick={() => setShowOrderNote(prev => !prev)}
                        >
                            <h3>Order Notes (optional)</h3>
                            <span>{showOrderNote ? '−' : '+'}</span>
                        </div>

                        <div
                            className={`${styles.orderNoteWrapper} ${showOrderNote ? styles.open : ''
                                }`}
                        >
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                placeholder="Add any notes about your order here..."
                                className={styles.textarea}
                                rows={4}
                            />
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
                                    checked={true}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.shippingDetails}>
                                    <div className={styles.shippingName}>Regular Shipping (3 to 4 days)</div>
                                </div>
                                <div className={styles.shippingPrice}>$41.00</div>
                            </label>
                        </div>

                    </div>

                    {/* Payment Methods */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Payment Methods</h2>
                        <div className={styles.shippingMethods}>
                            <label className={styles.shippingOption}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="creditCard"
                                    checked={true}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.shippingDetails}>
                                    <div className={styles.shippingName}>Credit Card</div>
                                </div>

                            </label>
                        </div>

                        <div className={styles.termsText}>
                            By placing an order, you agree to our <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
                        </div>


                        <button type="submit" className={styles.submitButton} disabled={isLoading || cartItems.length === 0}>
                            {isLoading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </form>

                {/* Order Summary */}
                <aside className={styles.orderSummary}>
                    <div className={styles.summaryCard}>
                        <h2 className={styles.summaryTitle}>Summary</h2>

                        <div className={styles.cartItemsContainer}>
                            {cartItems.map((item) => (
                                <div key={item.product.id} className={styles.productItem}>
                                    <div className={styles.productImage}>
                                        {item.product.imageUrl && item.product.imageUrl.length > 0 ? (
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.titleEn}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
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
                                        )}
                                    </div>
                                    <div className={styles.productDetails}>
                                        <div className={styles.productName}>{item.product.titleEn}</div>
                                        <div className={styles.productMeta}>Qty: {item.quantity}</div>
                                        <div className={styles.productPrice}>${(item.product.fromPrice * item.quantity).toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Subtotal</span>
                            <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Shipping</span>
                            <span className={styles.summaryValue}>${shippingCost.toFixed(2)}</span>
                        </div>
                        <div className={styles.shippingNote}>Regular Shipping (3 to 4 days)</div>

                        <div className={styles.summaryTotal}>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Total</span>
                                <span className={styles.summaryValue}>${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            <Footer isDark={true} />
        </>
    );
}