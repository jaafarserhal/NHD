import React, { useEffect, useRef, useState } from 'react';
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
import { validateEmail, generateOrderId } from '../../api/common/Utils';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useSystemPropertiesHelper from '../../hooks/useSystemPropertiesHelper';

// Initialize Stripe with error handling
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
console.log('Stripe Publishable Key loaded:', !!stripePublishableKey);

const stripePromise = loadStripe(stripePublishableKey || '').catch(error => {
    console.error('Failed to load Stripe:', error);
    return null;
});

// ─────────────────────────────────────────────────────────────────────────────
// SHARED TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface AddressData {
    firstName: string;
    lastName: string;
    phone: string;
    streetName: string;
    streetNumber: string;
    postalCode: string;
    city: string;
}

const emptyAddress = (): AddressData => ({
    firstName: '',
    lastName: '',
    phone: '',
    streetName: '',
    streetNumber: '',
    postalCode: '',
    city: '',
});

// ─────────────────────────────────────────────────────────────────────────────
// ROOT WRAPPER
//
// ALL state that must survive the CheckoutContent re-mount (which happens when
// clientSecret flips null → string, swapping CheckoutWithoutStripe for
// CheckoutWithStripe) is owned here:
//
//   • orderId        – must be the same value from PaymentIntent creation
//                      through to placeOrder
//   • guestEmailRef  – ref so email typed before the swap is still readable
//   • shippingData   – filled in Step 1; read in Step 2 to build the order
//   • billingData    – same reason
// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutWrapper() {

    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [showPaymentSection, setShowPaymentSection] = useState(false);
    const [stripeError, setStripeError] = useState<string | null>(null);

    // ✅ FIX 1: orderId generated once here so it never resets on re-mount
    const [orderId] = useState(() => generateOrderId());

    // ✅ FIX 2: address state lives here so it survives the re-mount
    const [shippingData, setShippingData] = useState<AddressData>(emptyAddress());
    const [billingData, setBillingData] = useState<AddressData>(emptyAddress());

    // ✅ Email ref lives here for the same reason (pre-existing fix kept as-is)
    const guestEmailRef = useRef<string>('');

    React.useEffect(() => {
        stripePromise
            .then(stripe => {
                if (!stripe) {
                    setStripeError('Payment system failed to initialize. Please refresh the page.');
                }
            })
            .catch(() => {
                setStripeError('Failed to load payment system. Please check your connection and refresh the page.');
            });
    }, []);

    const sharedProps = {
        orderId,
        shippingData,
        setShippingData,
        billingData,
        setBillingData,
        showPaymentSection,
        setShowPaymentSection,
        stripeError,
        setStripeError,
        guestEmailRef,
    };

    if (clientSecret) {
        return (
            <Elements
                stripe={stripePromise}
                options={{
                    clientSecret,
                    appearance: { theme: 'stripe' },
                }}
                key={clientSecret}
            >
                <CheckoutWithStripe
                    clientSecret={clientSecret}
                    setClientSecret={setClientSecret}
                    {...sharedProps}
                />
            </Elements>
        );
    }

    return (
        <CheckoutWithoutStripe
            setClientSecret={setClientSecret}
            {...sharedProps}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────
interface SharedProps {
    orderId: string;
    shippingData: AddressData;
    setShippingData: React.Dispatch<React.SetStateAction<AddressData>>;
    billingData: AddressData;
    setBillingData: React.Dispatch<React.SetStateAction<AddressData>>;
    showPaymentSection: boolean;
    setShowPaymentSection: (v: boolean) => void;
    stripeError: string | null;
    setStripeError: (error: string | null) => void;
    guestEmailRef: React.MutableRefObject<string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// WITH STRIPE  (rendered inside <Elements>)
// ─────────────────────────────────────────────────────────────────────────────
interface CheckoutWithStripeProps extends SharedProps {
    clientSecret: string;
    setClientSecret: (secret: string | null) => void;
}

function CheckoutWithStripe({
    clientSecret,
    setClientSecret,
    ...shared
}: CheckoutWithStripeProps) {
    const stripe = useStripe();
    const elements = useElements();

    // Only reveal the PaymentElement once stripe + elements are fully ready,
    // eliminating the race condition on first render after <Elements> mounts.
    useEffect(() => {
        if (stripe && elements && clientSecret) {
            shared.setShowPaymentSection(true);
        }
    }, [stripe, elements, clientSecret, shared.setShowPaymentSection]);

    return (
        <CheckoutContent
            clientSecret={clientSecret}
            setClientSecret={setClientSecret}
            stripe={stripe}
            elements={elements}
            {...shared}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// WITHOUT STRIPE  (rendered before clientSecret exists)
// ─────────────────────────────────────────────────────────────────────────────
interface CheckoutWithoutStripeProps extends SharedProps {
    setClientSecret: (secret: string | null) => void;
}

function CheckoutWithoutStripe({
    setClientSecret,
    ...shared
}: CheckoutWithoutStripeProps) {
    return (
        <CheckoutContent
            clientSecret={null}
            setClientSecret={setClientSecret}
            stripe={null}
            elements={null}
            {...shared}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONTENT
// ─────────────────────────────────────────────────────────────────────────────
interface CheckoutContentProps extends SharedProps {
    clientSecret: string | null;
    setClientSecret: (secret: string | null) => void;
    stripe: any;
    elements: any;
}

function CheckoutContent({
    clientSecret,
    setClientSecret,
    stripe,
    elements,
    orderId,
    shippingData,
    setShippingData,
    billingData,
    setBillingData,
    showPaymentSection,
    setShowPaymentSection,
    stripeError,
    setStripeError,
    guestEmailRef,
}: CheckoutContentProps) {
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

    // Customer addresses state
    const [customerAddresses, setCustomerAddresses] = useState<CustomerAddresses | null>(null);
    const [showShippingForm, setShowShippingForm] = useState(true);
    const [showBillingForm, setShowBillingForm] = useState(true);

    // Calculate summary values
    const shippingCost = useSystemPropertiesHelper().getShippingCost();
    const shippingArrivalTime = useSystemPropertiesHelper().getShippingArrivalTime();
    const { getCurrencySymbol, getShippingCostDisplay } = useSystemPropertiesHelper();
    const subtotal = getTotalPrice();
    // ✅ orderId comes from props (stable parent) — no local useState here
    const totalAmount = subtotal + shippingCost;

    const [formData, setFormData] = useState({
        email: '',
        note: '',
    });

    // ✅ shippingData / billingData come from props — no local useState here.
    //    We use the setters passed down from CheckoutWrapper directly.

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name.startsWith('billing_')) {
            const billingFieldName = name.replace('billing_', '') as keyof AddressData;
            setBillingData(prev => ({ ...prev, [billingFieldName]: value }));
        } else if (
            ['firstName', 'lastName', 'phone', 'streetName', 'streetNumber', 'postalCode', 'city'].includes(name)
        ) {
            setShippingData(prev => ({ ...prev, [name as keyof AddressData]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));

            // Mirror email into the stable parent ref immediately (synchronous).
            if (name === 'email') {
                guestEmailRef.current = value;
            }

            // Real-time email validation for guest users
            if (name === 'email' && !isLoggedIn) {
                if (value?.trim() && !validateEmail(value.trim())) {
                    setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
                } else {
                    setErrors(prev => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                    });
                }
            }
        }

        if (name === 'sameAddress') {
            setIsBillingSameAsShipping(checked);
            if (customerAddresses) {
                const hasBilling = customerAddresses.billingAddressId !== 0;
                setShowBillingForm(!hasBilling && !checked);
            } else {
                setShowBillingForm(!checked);
            }
        }

        // Clear field-level error on change
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const validateForm = (): boolean => {
        const validationErrors: { [key: string]: string } = {};

        if (showShippingForm) {
            if (!shippingData.firstName?.trim()) validationErrors.firstName = 'First name is required';
            if (!shippingData.lastName?.trim()) validationErrors.lastName = 'Last name is required';
            if (!shippingData.streetName?.trim()) validationErrors.streetName = 'Street name is required';
            if (!shippingData.streetNumber?.trim()) validationErrors.streetNumber = 'Street number is required';
            if (!shippingData.postalCode?.trim()) validationErrors.postalCode = 'Postal code is required';
            if (!shippingData.city?.trim()) validationErrors.city = 'City is required';
            if (!shippingData.phone?.trim()) validationErrors.phone = 'Phone number is required';
        }

        if (!isLoggedIn) {
            if (!formData.email?.trim()) {
                validationErrors.email = 'Email is required';
            } else if (!validateEmail(formData.email?.trim())) {
                validationErrors.email = 'Invalid email format';
            }
        }

        if (!isBillingSameAsShipping && showBillingForm) {
            if (!billingData.firstName?.trim()) validationErrors.billing_firstName = 'Billing first name is required';
            if (!billingData.lastName?.trim()) validationErrors.billing_lastName = 'Billing last name is required';
            if (!billingData.streetName?.trim()) validationErrors.billing_streetName = 'Billing street name is required';
            if (!billingData.streetNumber?.trim()) validationErrors.billing_streetNumber = 'Billing street number is required';
            if (!billingData.postalCode?.trim()) validationErrors.billing_postalCode = 'Billing postal code is required';
            if (!billingData.city?.trim()) validationErrors.billing_city = 'Billing city is required';
            if (!billingData.phone?.trim()) validationErrors.billing_phone = 'Billing phone number is required';
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    // Step 1 – validate form, create PaymentIntent, set clientSecret.
    const handleContinueToPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsLoading(true);
            setErrors(prev => {
                const next = { ...prev };
                delete next.payment;
                delete next.order;
                return next;
            });

            const customerEmail = isLoggedIn
                ? customerAddresses?.email
                : (guestEmailRef.current || formData.email);

            console.log('Creating payment intent with email:', customerEmail);
            // ✅ orderId from stable parent — same value that will be used in placeOrder
            console.log('Using orderId:', orderId);

            const response = await authService.createPaymentIntent({
                amount: totalAmount,
                currency: getCurrencySymbol(),
                customerEmail,
                description: orderId,
                orderId: orderId,
            });

            if (response?.data?.clientSecret) {
                setClientSecret(response.data.clientSecret);
                setIsLoading(false);
            } else {
                throw new Error('No client secret received from payment intent');
            }
        } catch (err: any) {
            console.error('Payment initialization error:', err);
            setErrors(prev => ({
                ...prev,
                payment: err.message || 'Failed to initialize payment. Please try again.',
            }));
            setIsLoading(false);
        }
    };

    // Step 2 – confirm payment, then place order
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setErrors(prev => ({
                ...prev,
                payment: 'Payment form is still loading. Please try again in a moment.',
            }));
            return;
        }

        if (!clientSecret) {
            setErrors(prev => ({
                ...prev,
                payment: 'Payment not initialized. Please refresh the page.',
            }));
            return;
        }

        try {
            setIsLoading(true);

            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw new Error(submitError.message || 'Please complete all payment fields');
            }
            const receiptEmail = isLoggedIn ? customerAddresses?.email : guestEmailRef.current;

            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    receipt_email: receiptEmail,
                    payment_method_data: {
                        billing_details: {
                            address: {
                                country: 'SE',
                            },
                        },
                    },
                },
                redirect: 'if_required',
            });

            if (confirmError) throw new Error(confirmError.message || 'Payment failed');

            if (paymentIntent?.status === 'succeeded') {
                await handlePaymentSuccess(paymentIntent.id);
            } else {
                throw new Error('Payment was not completed');
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setErrors(prev => ({
                ...prev,
                payment: err.message || 'Payment failed. Please try again.',
            }));
            setIsLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        setIsLoading(true);
        try {
            // ✅ shippingData & billingData from stable parent props — always populated
            // ✅ orderId from stable parent props — same value used in PaymentIntent
            const orderData = isLoggedIn
                ? buildAuthenticatedOrderData(paymentIntentId)
                : buildGuestOrderData(paymentIntentId);

            console.log('Order data being sent:', orderData);

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

    const buildAuthenticatedOrderData = (paymentIntentId: string) => ({
        shipping: {
            id: customerAddresses?.shippingAddressId || 0,
            ...shippingData,
            typeId: AddressTypeEnum.Shipping,
        },
        billing: isBillingSameAsShipping
            ? {
                id: customerAddresses?.billingAddressId || 0,
                ...shippingData,
                typeId: AddressTypeEnum.Billing,
            }
            : {
                id: customerAddresses?.billingAddressId || 0,
                ...billingData,
                typeId: AddressTypeEnum.Billing,
            },
        items: cartItems.map(item => ({
            productId: item.product.id,
            price: item.product.fromPrice,
            quantity: item.quantity,
        })),
        totalPrice: totalAmount,
        note: formData.note || '',
        paymentIntentId,
        generatedOrderId: orderId,
        isBillingSameAsShipping:
            customerAddresses?.billingAddressId !== 0 && customerAddresses?.shippingAddressId !== 0
                ? false
                : isBillingSameAsShipping,
    });

    const buildGuestOrderData = (paymentIntentId: string) => {
        const emailToUse = guestEmailRef.current || formData.email;
        console.log('buildGuestOrderData — email:', emailToUse, '| shippingData:', shippingData);
        return {
            email: emailToUse,
            shipping: { ...shippingData, typeId: AddressTypeEnum.Shipping },
            billing: isBillingSameAsShipping
                ? { ...shippingData, typeId: AddressTypeEnum.Billing }
                : { ...billingData, typeId: AddressTypeEnum.Billing },
            items: cartItems.map(item => ({
                productId: item.product.id,
                price: item.product.fromPrice,
                quantity: item.quantity,
            })),
            totalPrice: totalAmount,
            note: formData.note || '',
            paymentIntentId,
            generatedOrderId: orderId,
            isBillingSameAsShipping,
        };
    };

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
        setErrors(prev => ({ ...prev, order: errorMessage }));
        console.error('Order error:', errorMessage);
    };

    const fetchCustomerAddresses = async () => {
        try {
            setIsLoading(true);
            const response = await authService.getCustomerAddresses();
            if (response?.data) {
                const addresses: CustomerAddresses = response.data;
                setCustomerAddresses(addresses);
                setShowShippingForm(addresses.shippingAddressId === 0);
                setShowBillingForm(addresses.billingAddressId === 0);
            }
        } catch (error) {
            console.error('Error fetching customer addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = storage.get('webAuthToken');
        setIsLoggedIn(!!token);
        if (token) fetchCustomerAddresses();
        setCartInitialized(true);

        const img = new Image();
        img.src = '/assets/images/banner/contact-us-banner.webp';
        img.onload = () => setImageLoaded(true);
    }, []);

    useEffect(() => {
        if (cartInitialized && cartItems.length === 0 && !orderPlaced) {
            navigate(routeUrls.cart);
        }
    }, [cartItems.length, cartInitialized, orderPlaced, navigate]);

    // ─── Thank You Screen ───────────────────────────────────────────────────
    const ThankYouMessage = React.memo(() => (
        <div className={styles.thankYouOverlay}>
            <div className={styles.thankYouCard}>
                <div className={styles.thankYouIcon}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#10B981" fillOpacity="0.1" />
                        <path
                            d="M8 12L11 15L16 9"
                            stroke="#10B981"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <h2 className={styles.thankYouTitle}>Thank You for Your Order!</h2>
                <p className={styles.thankYouMessage}>
                    Your order has been successfully placed. We'll send you a confirmation email shortly with your
                    order details.
                </p>
                <button className={styles.homeButton} onClick={() => navigate(routeUrls.home)}>
                    Go Home
                </button>
            </div>
        </div>
    ));

    // ─── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            <Header />

            <div
                className="breadcrumb"
                style={{
                    backgroundImage: "url(/assets/images/banner/contact-us-banner.webp)",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: imageLoaded ? 1 : 0.9,
                    transition: 'opacity 0.3s ease-in-out',
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb_content">
                                <h1 className="breadcrumb_title">Checkout</h1>
                                <ul className="breadcrumb_list">
                                    <li><a href="/">Home</a></li>
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
                    <Loader loading={isLoading} fullscreen={false} isDark={true} />

                    {/* ── STEP 1: Address / details form ─────────────────── */}
                    {!showPaymentSection && (
                        <form className={styles.checkoutForm} onSubmit={handleContinueToPayment}>

                            {/* Email (guest only) */}
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

                            {/* Shipping */}
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
                                                <FormField label="First Name" name="firstName" value={shippingData.firstName} error={errors.firstName} onChange={handleInputChange} placeholder="John" required />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <FormField label="Last Name" name="lastName" value={shippingData.lastName} error={errors.lastName} onChange={handleInputChange} placeholder="Doe" required />
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <FormField label="Street Name" name="streetName" value={shippingData.streetName} error={errors.streetName} onChange={handleInputChange} placeholder="Enter street name" required />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <FormField label="Street Number" name="streetNumber" value={shippingData.streetNumber} error={errors.streetNumber} onChange={handleInputChange} placeholder="Enter street number" required />
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <FormField label="City" name="city" value={shippingData.city} error={errors.city} onChange={handleInputChange} placeholder="City" required />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <FormField label="Postal Code" name="postalCode" value={shippingData.postalCode} error={errors.postalCode} onChange={handleInputChange} placeholder="10001" maxLength={5} required />
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <FormField label="Phone Number" name="phone" type="tel" value={shippingData.phone} error={errors.phone} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isLoggedIn && !showShippingForm && !showBillingForm && (
                                    <div className={styles.loggedInMessage}>
                                        <p>✓ Primary Shipping &amp; Billing address already saved to your account.</p>
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

                            {/* Billing – logged-in, different address, already saved */}
                            {isLoggedIn && !isBillingSameAsShipping && !showBillingForm && showShippingForm && (
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>Billing Information</h2>
                                    <div className={styles.loggedInMessage}>
                                        <p>✓ Primary Billing address already saved to your account.</p>
                                    </div>
                                </div>
                            )}

                            {/* Billing – needs form input */}
                            {!isBillingSameAsShipping && showBillingForm && (
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>Billing Information</h2>
                                    {isLoggedIn && (
                                        <p className={styles.loggedInMessage}>
                                            No primary billing address found. Please add one below or check "My billing
                                            and shipping address are the same".
                                        </p>
                                    )}
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <FormField label="First Name" name="billing_firstName" value={billingData.firstName} error={errors.billing_firstName} onChange={handleInputChange} placeholder="John" required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <FormField label="Last Name" name="billing_lastName" value={billingData.lastName} error={errors.billing_lastName} onChange={handleInputChange} placeholder="Doe" required />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <FormField label="Street Name" name="billing_streetName" value={billingData.streetName} error={errors.billing_streetName} onChange={handleInputChange} placeholder="Enter street name" required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <FormField label="Street Number" name="billing_streetNumber" value={billingData.streetNumber} error={errors.billing_streetNumber} onChange={handleInputChange} placeholder="Enter street number" required />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <FormField label="City" name="billing_city" value={billingData.city} error={errors.billing_city} onChange={handleInputChange} placeholder="City" required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <FormField label="Postal Code" name="billing_postalCode" value={billingData.postalCode} error={errors.billing_postalCode} onChange={handleInputChange} placeholder="10001" maxLength={5} required />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <FormField label="Phone Number" name="billing_phone" type="tel" value={billingData.phone} error={errors.billing_phone} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Notes */}
                            <div className={styles.optionalSection}>
                                <div className={styles.optionalHeader} onClick={() => setShowOrderNote(prev => !prev)}>
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

                            {/* Shipping Method */}
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Shipping Methods</h2>
                                <div className={styles.shippingMethods}>
                                    <label className={styles.shippingOption}>
                                        <input type="radio" name="shippingMethod" value="regular" checked readOnly />
                                        <div className={styles.shippingDetails}>
                                            <div className={styles.shippingName}>{shippingArrivalTime}</div>
                                        </div>
                                        <div className={styles.shippingPrice}>{getShippingCostDisplay()}</div>
                                    </label>
                                </div>
                            </div>

                            {/* Payment init error */}
                            {errors.payment && (
                                <div className={styles.paymentError}>{errors.payment}</div>
                            )}

                            <div className={styles.formSection}>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={isLoading || cartItems.length === 0}
                                >
                                    {isLoading ? 'Processing...' : 'Continue to Payment'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── STEP 2: Payment form ────────────────────────────── */}
                    {showPaymentSection && (
                        <form className={styles.checkoutForm} onSubmit={handlePlaceOrder}>
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Payment Methods</h2>

                                {clientSecret && stripe && elements ? (
                                    <div className={styles.paymentElementWrapper}>
                                        <PaymentElement
                                            options={{
                                                layout: 'accordion',
                                                paymentMethodOrder: ['card'],
                                                fields: {
                                                    billingDetails: {
                                                        address: { country: 'never' },
                                                    },
                                                },
                                                terms: { card: 'never' },
                                                wallets: {
                                                    applePay: 'never',
                                                    googlePay: 'never',
                                                },
                                                business: { name: 'NHD' },
                                                defaultValues: {
                                                    billingDetails: {
                                                        address: { country: 'SE' },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.paymentLoading}>
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <div>Loading payment form…</div>
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                                                If this takes too long, please refresh the page.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Payment / Stripe errors */}
                                {(errors.payment || stripeError) && (
                                    <div className={styles.paymentError}>
                                        {errors.payment || stripeError}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setErrors(prev => {
                                                    const next = { ...prev };
                                                    delete next.payment;
                                                    return next;
                                                });
                                                setStripeError(null);
                                                setShowPaymentSection(false);
                                                setClientSecret(null);
                                            }}
                                            style={{
                                                marginLeft: '10px',
                                                padding: '5px 10px',
                                                fontSize: '12px',
                                                backgroundColor: '#f3f4f6',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}

                                {errors.order && (
                                    <div className={styles.paymentError}>{errors.order}</div>
                                )}
                            </div>

                            <div className={styles.termsText}>
                                By placing an order, you agree to our{' '}
                                <a href="#">Terms &amp; Conditions</a> and{' '}
                                <a href="#">Privacy Policy</a>.
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={
                                    isLoading ||
                                    cartItems.length === 0 ||
                                    !clientSecret ||
                                    !stripe ||
                                    !elements
                                }
                            >
                                {isLoading ? 'Processing…' : 'Place Order'}
                            </button>
                        </form>
                    )}

                    {/* Order Summary – always visible */}
                    <aside className={styles.orderSummary}>
                        <div className={styles.summaryCard}>
                            <h2 className={styles.summaryTitle}>Summary</h2>

                            <div className={styles.cartItemsContainer}>
                                {cartItems.map(item => (
                                    <div key={item.product.id} className={styles.productItem}>
                                        <div className={styles.productImage}>
                                            {item.product.imageUrl?.length > 0 ? (
                                                <img
                                                    src={`${process.env.REACT_APP_BASE_URL || ""}${item.product.imageUrl ?? "/assets/images/placeholder.png"}`}
                                                    alt={item.product.titleEn}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                        fontWeight: '500',
                                                    }}
                                                >
                                                    PRODUCT
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.productDetails}>
                                            <div className={styles.productName}>{item.product.titleEn}</div>
                                            <div className={styles.productMeta}>Qty: {item.quantity}</div>
                                            <div className={styles.productPrice}>
                                                {getCurrencySymbol()} {(item.product.fromPrice * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Subtotal</span>
                                <span className={styles.summaryValue}>{getCurrencySymbol()} {subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Shipping</span>
                                <span className={styles.summaryValue}>{getShippingCostDisplay()}</span>
                            </div>
                            <div className={styles.shippingNote}>{shippingArrivalTime}</div>

                            <div className={styles.summaryTotal}>
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>Total</span>
                                    <span className={styles.summaryValue}>{getCurrencySymbol()} {totalAmount.toFixed(2)}</span>
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