import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import Footer from '../../components/Common/Footer/Index';
import Header from '../../components/Common/Header/Index';
import { routeUrls } from '../../api/base/routeUrls';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../api/base/storage';
import FormField from '../../components/Common/FormField/Index';
import { AddressTypeEnum } from '../../api/common/Enums';
import { CustomerAddresses } from '../../api/common/Types';
import { useCart } from '../../contexts/CartContext';
import authService from '../../api/authService';
import Loader from '../../components/Common/Loader/Index';
import { validateEmail } from '../../api/common/Utils';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

// Main wrapper that manages clientSecret and Elements provider
export default function CheckoutWrapper() {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    // If we have a clientSecret, wrap with Elements provider
    if (clientSecret) {
        return (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutWithStripe clientSecret={clientSecret} setClientSecret={setClientSecret} />
            </Elements>
        );
    }

    // Otherwise, render without Stripe context
    return <CheckoutWithoutStripe setClientSecret={setClientSecret} />;
}

// Checkout component WITH Stripe hooks (used when clientSecret exists)
interface CheckoutWithStripeProps {
    clientSecret: string;
    setClientSecret: (secret: string | null) => void;
}

function CheckoutWithStripe({ clientSecret, setClientSecret }: CheckoutWithStripeProps) {
    const stripe = useStripe();
    const elements = useElements();

    return (
        <CheckoutContent
            clientSecret={clientSecret}
            setClientSecret={setClientSecret}
            stripe={stripe}
            elements={elements}
        />
    );
}

// Checkout component WITHOUT Stripe hooks (used before clientSecret exists)
interface CheckoutWithoutStripeProps {
    setClientSecret: (secret: string | null) => void;
}

function CheckoutWithoutStripe({ setClientSecret }: CheckoutWithoutStripeProps) {
    return (
        <CheckoutContent
            clientSecret={null}
            setClientSecret={setClientSecret}
            stripe={null}
            elements={null}
        />
    );
}

// Main Checkout Content Component (shared by both)
interface CheckoutContentProps {
    clientSecret: string | null;
    setClientSecret: (secret: string | null) => void;
    stripe: any;
    elements: any;
}

function CheckoutContent({ clientSecret, setClientSecret, stripe, elements }: CheckoutContentProps) {
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
    const [isPaymentReady, setIsPaymentReady] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Customer addresses state
    const [customerAddresses, setCustomerAddresses] = useState<CustomerAddresses | null>(null);
    const [showShippingForm, setShowShippingForm] = useState(true);
    const [showBillingForm, setShowBillingForm] = useState(true);

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

            // Real-time email validation for guest users
            if (name === 'email' && !isLoggedIn) {
                if (value?.trim() && !validateEmail(value.trim())) {
                    setErrors(prev => ({
                        ...prev,
                        email: "Invalid email format"
                    }));
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.email;
                        return newErrors;
                    });
                }
            }
        }

        if (name === "sameAddress") {
            setIsBillingSameAsShipping(checked);

            if (customerAddresses) {
                const hasBilling = customerAddresses.billingAddressId !== 0;
                setShowBillingForm(!hasBilling && !checked);
            } else {
                setShowBillingForm(!checked);
            }
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

        // Shipping validation
        if (showShippingForm) {
            if (!shippingData.firstName?.trim()) validationErrors.firstName = "First name is required";
            if (!shippingData.lastName?.trim()) validationErrors.lastName = "Last name is required";
            if (!shippingData.streetName?.trim()) validationErrors.streetName = "Street name is required";
            if (!shippingData.streetNumber?.trim()) validationErrors.streetNumber = "Street number is required";
            if (!shippingData.postalCode?.trim()) validationErrors.postalCode = "Postal code is required";
            if (!shippingData.city?.trim()) validationErrors.city = "City is required";
            if (!shippingData.phone?.trim()) validationErrors.phone = "Phone number is required";
        }

        // Email validation (only for guest users)
        if (!isLoggedIn) {
            if (!formData.email?.trim()) {
                validationErrors.email = "Email is required";
            } else if (!validateEmail(formData.email?.trim())) {
                validationErrors.email = "Invalid email format";
            }
        }

        // Billing validation
        if (!isBillingSameAsShipping && showBillingForm) {
            if (!billingData.firstName?.trim()) validationErrors.billing_firstName = "Billing first name is required";
            if (!billingData.lastName?.trim()) validationErrors.billing_lastName = "Billing last name is required";
            if (!billingData.streetName?.trim()) validationErrors.billing_streetName = "Billing street name is required";
            if (!billingData.streetNumber?.trim()) validationErrors.billing_streetNumber = "Billing street number is required";
            if (!billingData.postalCode?.trim()) validationErrors.billing_postalCode = "Billing postal code is required";
            if (!billingData.city?.trim()) validationErrors.billing_city = "Billing city is required";
            if (!billingData.phone?.trim()) validationErrors.billing_phone = "Billing phone number is required";
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    // Handle form submission and payment
    const handleContinueToPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!stripe || !elements) {
            setErrors(prev => ({
                ...prev,
                payment: 'Payment form is still loading. Please try again in a moment.'
            }));
            return;
        }

        if (!clientSecret) {
            setErrors(prev => ({
                ...prev,
                payment: 'Payment not initialized. Please refresh the page.'
            }));
            return;
        }

        try {
            setIsLoading(true);

            // Submit the payment element to ensure validation
            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw new Error(submitError.message || 'Please complete all payment fields');
            }

            // Confirm the payment
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    receipt_email: isLoggedIn ? undefined : formData.email,
                },
                redirect: 'if_required',
            });

            if (confirmError) {
                throw new Error(confirmError.message || 'Payment failed');
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Place order after successful payment
                await handlePaymentSuccess(paymentIntent.id);
            } else {
                throw new Error('Payment was not completed');
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setErrors(prev => ({
                ...prev,
                payment: err.message || 'Payment failed. Please try again.'
            }));
            setIsLoading(false);
        }
    };

    // Handle successful payment
    const handlePaymentSuccess = async (paymentIntentId: string) => {
        setIsLoading(true);

        try {
            const orderData = isLoggedIn ? buildAuthenticatedOrderData(paymentIntentId) : buildGuestOrderData(paymentIntentId);

            const response = isLoggedIn
                ? await authService.placeOrder(orderData)
                : await authService.placeOrderAsGuest(orderData);

            if (response?.data) {
                setTimeout(() => {
                    setIsLoading(false);
                    clearCart();
                    setOrderPlaced(true);
                }, 2000);
            } else {
                throw new Error('Failed to place order');
            }
        } catch (error: any) {
            setIsLoading(false);
            handleOrderError(error);
        }
    };

    // Helper function to build authenticated order data
    const buildAuthenticatedOrderData = (paymentIntentId: string) => {
        return {
            shipping: {
                id: customerAddresses?.shippingAddressId || 0,
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
                id: customerAddresses?.billingAddressId || 0,
                firstName: shippingData.firstName,
                lastName: shippingData.lastName,
                phone: shippingData.phone,
                streetName: shippingData.streetName,
                streetNumber: shippingData.streetNumber,
                postalCode: shippingData.postalCode,
                city: shippingData.city,
                typeId: AddressTypeEnum.Billing
            } : {
                id: customerAddresses?.billingAddressId || 0,
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
            paymentIntentId: paymentIntentId,
            isBillingSameAsShipping: customerAddresses?.billingAddressId !== 0 && customerAddresses?.shippingAddressId !== 0 ? false : isBillingSameAsShipping
        };
    };

    // Helper function to build guest order data
    const buildGuestOrderData = (paymentIntentId: string) => {
        return {
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
            paymentIntentId: paymentIntentId,
            isBillingSameAsShipping: isBillingSameAsShipping
        };
    };

    // Helper function to handle order errors
    const handleOrderError = (error: any) => {
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

        setErrors(prev => ({
            ...prev,
            order: errorMessage
        }));
        console.error('Order error:', errorMessage);
    };

    // Fetch customer addresses for logged-in users
    const fetchCustomerAddresses = async () => {
        try {
            setIsLoading(true);
            const response = await authService.getCustomerAddresses();
            if (response?.data) {
                const addresses: CustomerAddresses = response.data;
                setCustomerAddresses(addresses);

                const hasShipping = addresses.shippingAddressId !== 0;
                const hasBilling = addresses.billingAddressId !== 0;

                setShowShippingForm(!hasShipping);
                setShowBillingForm(!hasBilling);
            }
        } catch (error) {
            console.error('Error fetching customer addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize component on mount
    useEffect(() => {
        const token = storage.get('webAuthToken');
        setIsLoggedIn(!!token);

        if (token) {
            fetchCustomerAddresses();
        }

        setCartInitialized(true);

        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, []);

    // Handle cart empty redirect
    useEffect(() => {
        if (cartInitialized && cartItems.length === 0 && !orderPlaced) {
            navigate(routeUrls.cart);
        }
    }, [cartItems.length, cartInitialized, orderPlaced, navigate]);

    // Initialize payment intent when cart is ready
    useEffect(() => {
        const initializePayment = async () => {
            if (cartInitialized && cartItems.length > 0 && !clientSecret && !orderPlaced) {
                try {
                    const response = await authService.createPaymentIntent({
                        amount: totalAmount,
                        currency: 'sek',
                        customerEmail: isLoggedIn ? customerAddresses?.email : formData.email,
                        description: 'NHD Order Payment',
                    });

                    if (response?.data?.clientSecret) {
                        setClientSecret(response.data.clientSecret);
                    }
                } catch (err) {
                    console.error('Payment initialization error:', err);
                    setErrors(prev => ({
                        ...prev,
                        payment: 'Failed to initialize payment. Please refresh the page.'
                    }));
                    setIsInitializing(false);
                }
            }
        };

        initializePayment();
    }, [cartInitialized, cartItems.length, clientSecret, orderPlaced, totalAmount, isLoggedIn, formData.email]);

    // Determine if loader should show
    const shouldShowLoader = isLoading || isInitializing || (!!clientSecret && !isPaymentReady);

    // Thank you message component
    const ThankYouMessage = React.memo(() => (
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
    ));

    return (
        <>
            <Header />
            <div
                className="breadcrumb"
                style={{
                    backgroundImage: "url(/assets/images/banner/contact-us-banner.webp)",
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

            {orderPlaced && <ThankYouMessage />}

            {!orderPlaced && (
                <div className={styles.checkoutContainer}>
                    <Loader
                        loading={shouldShowLoader}
                        fullscreen={false}
                        isDark={true}
                    />

                    <form className={styles.checkoutForm} onSubmit={handleContinueToPayment}>
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

                            {isLoggedIn && !showShippingForm && showBillingForm && (
                                <div className={styles.loggedInMessage}>
                                    <p>✓ Primary Shipping address already saved to your account.</p>
                                </div>
                            )}

                            {isLoggedIn && showShippingForm && (
                                <p className={styles.loggedInMessage}>
                                    No primary shipping address found. Please add one below.
                                </p>
                            )}

                            {showShippingForm && (
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
                                </>
                            )}

                            {isLoggedIn && !showShippingForm && !showBillingForm && (
                                <div className={styles.loggedInMessage}>
                                    <p>✓ Primary Shipping & Billing address already saved to your account.</p>
                                </div>
                            )}

                            {(!isLoggedIn || showShippingForm || showBillingForm) && (
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
                            )}
                        </div>

                        {/* Billing Information */}
                        {isLoggedIn && !isBillingSameAsShipping && !showBillingForm && showShippingForm && (
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Billing Information</h2>
                                <div className={styles.loggedInMessage}>
                                    <p>✓ Primary Billing address already saved to your account.</p>
                                </div>
                            </div>
                        )}

                        {!isBillingSameAsShipping && showBillingForm && (
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Billing Information</h2>

                                {isLoggedIn && (
                                    <p className={styles.loggedInMessage}>
                                        No primary billing address found. Please add one below or check "My billing and shipping address are the same".
                                    </p>
                                )}

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

                        {/* Order Notes */}
                        <div className={styles.optionalSection}>
                            <div
                                className={styles.optionalHeader}
                                onClick={() => setShowOrderNote(prev => !prev)}
                            >
                                <h3>Order Notes (optional)</h3>
                                <span>{showOrderNote ? '−' : '+'}</span>
                            </div>

                            <div className={`${styles.orderNoteWrapper} ${showOrderNote ? styles.open : ''}`}>
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
                                        readOnly
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

                            {clientSecret && (
                                <div className={styles.paymentElementWrapper}>
                                    <PaymentElement
                                        onReady={() => {
                                            setIsPaymentReady(true);
                                            setIsInitializing(false);
                                        }}
                                        options={{
                                            layout: 'accordion',
                                            paymentMethodOrder: ['card'],
                                            fields: {
                                                billingDetails: {
                                                    address: {
                                                        country: 'never'
                                                    }
                                                }
                                            },
                                            terms: {
                                                card: 'never'
                                            },
                                            wallets: {
                                                applePay: 'never',
                                                googlePay: 'never'
                                            },
                                            business: {
                                                name: 'NHD'
                                            },
                                            defaultValues: {
                                                billingDetails: {
                                                    address: {
                                                        country: 'SE'
                                                    }
                                                }
                                            }
                                        }}
                                    />

                                    {(!stripe || !elements) && (
                                        <div className={styles.paymentLoading}>
                                            Loading payment form...
                                        </div>
                                    )}
                                </div>
                            )}

                            {errors.payment && (
                                <div className={styles.paymentError}>
                                    {errors.payment}
                                </div>
                            )}

                            {errors.order && (
                                <div className={styles.paymentError}>
                                    {errors.order}
                                </div>
                            )}

                            <div className={styles.termsText}>
                                By placing an order, you agree to our <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isLoading || cartItems.length === 0 || !clientSecret || !stripe || !elements}
                            >
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
            )}

            <Footer isDark={true} />
        </>
    );
}