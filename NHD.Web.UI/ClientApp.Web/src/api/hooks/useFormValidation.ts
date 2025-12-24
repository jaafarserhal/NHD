import { useState } from 'react';

export const useFormValidation = <T extends Record<string, any>>(initialValues: T) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateField = (name: string, validator: (value: any) => string | null) => {
        const error = validator(values[name]);
        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
            return false;
        }
        return true;
    };

    return { values, errors, setValues, setErrors, handleChange, validateField };
};