import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QcCN1HIQjRX20Ll5Y2hQiYVVq4W0BV9Lk4YL6T1zOaEr0GkF4kDhKRJoSjZmY2tGnQ6vFgShRc0xP3YdR9qfGqX00L4yQtjfQ');

const StripeContext = createContext();

export const useStripe = () => {
    const context = useContext(StripeContext);
    if (!context) {
        throw new Error('useStripe must be used within a StripeProvider');
    }
    return context;
};

export const StripeProvider = ({ children }) => {
    return (
        <StripeContext.Provider value={{ stripePromise }}>
            {children}
        </StripeContext.Provider>
    );
};