import { useSystemProperties } from '../contexts/SystemPropertiesContext';

/**
 * Custom hook that provides utility functions for working with system properties
 */
export const useSystemPropertiesHelper = () => {
    const { systemProperties, isLoading, error, refreshSystemProperties } = useSystemProperties();

    const getShippingCost = (): number => {
        if (!systemProperties?.shippingCost) return 0;

        // Remove any currency symbols and parse as number
        const cleanedCost = systemProperties.shippingCost.replace(/[^0-9.-]/g, '');
        const cost = parseFloat(cleanedCost);
        return isNaN(cost) ? 0 : cost;
    };

    const getShippingCostDisplay = (currencySymbol: string = '$'): string => {
        const cost = getShippingCost();
        return cost > 0 ? `${currencySymbol}${cost.toFixed(2)}` : 'Free Shipping';
    };

    const getShippingArrivalTime = (): string => {
        return systemProperties?.shippingArrivalTime || 'Not specified';
    };

    const isShippingFree = (): boolean => {
        return getShippingCost() === 0;
    };

    const hasProperties = (): boolean => {
        return systemProperties !== null && !isLoading && !error;
    };

    return {
        // Original context values
        systemProperties,
        isLoading,
        error,
        refreshSystemProperties,

        // Utility functions
        getShippingCost,
        getShippingCostDisplay,
        getShippingArrivalTime,
        isShippingFree,
        hasProperties,
    };
};

export default useSystemPropertiesHelper;