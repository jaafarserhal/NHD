import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import authService from '../api/authService';

interface SystemProperties {
    shippingCost: string;
    shippingArrivalTime: string;
    currencySymbol?: string;
}

interface SystemPropertiesContextType {
    systemProperties: SystemProperties | null;
    isLoading: boolean;
    error: string | null;
    refreshSystemProperties: () => Promise<void>;
}

type SystemPropertiesAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_PROPERTIES'; payload: SystemProperties }
    | { type: 'SET_ERROR'; payload: string | null };

interface SystemPropertiesState {
    systemProperties: SystemProperties | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: SystemPropertiesState = {
    systemProperties: null,
    isLoading: false,
    error: null,
};

const systemPropertiesReducer = (
    state: SystemPropertiesState,
    action: SystemPropertiesAction
): SystemPropertiesState => {
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        case 'SET_PROPERTIES':
            return {
                ...state,
                systemProperties: action.payload,
                isLoading: false,
                error: null,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };
        default:
            return state;
    }
};

const SystemPropertiesContext = createContext<SystemPropertiesContextType | undefined>(undefined);

interface SystemPropertiesProviderProps {
    children: ReactNode;
}

export const SystemPropertiesProvider: React.FC<SystemPropertiesProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(systemPropertiesReducer, initialState);

    const fetchSystemProperties = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            const response = await authService.getSystemProperties();

            if (response && response.data) {
                const properties: SystemProperties = {
                    shippingCost: response.data.shippingCost || '',
                    shippingArrivalTime: response.data.shippingArrivalTime || '',
                    currencySymbol: 'SEK',
                };
                dispatch({ type: 'SET_PROPERTIES', payload: properties });
            } else {
                throw new Error('Failed to fetch system properties');
            }
        } catch (error) {
            console.error('Error fetching system properties:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load system properties' });
        }
    };

    const refreshSystemProperties = async () => {
        await fetchSystemProperties();
    };

    // Fetch system properties on component mount
    useEffect(() => {
        fetchSystemProperties();
    }, []);

    const contextValue: SystemPropertiesContextType = {
        systemProperties: state.systemProperties,
        isLoading: state.isLoading,
        error: state.error,
        refreshSystemProperties,
    };

    return (
        <SystemPropertiesContext.Provider value={contextValue}>
            {children}
        </SystemPropertiesContext.Provider>
    );
};

export const useSystemProperties = (): SystemPropertiesContextType => {
    const context = useContext(SystemPropertiesContext);
    if (context === undefined) {
        throw new Error('useSystemProperties must be used within a SystemPropertiesProvider');
    }
    return context;
};

export default SystemPropertiesContext;