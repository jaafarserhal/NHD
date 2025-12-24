import React from 'react';

interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    value?: string;
    error?: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    error,
    placeholder,
    onChange,
    required = false
}) => {
    return (
        <div className="col-12 mt-1">
            <label htmlFor={name}>
                {label} {required && <abbr className="required">*</abbr>}
            </label>
            <input
                className="form-field"
                type={type}
                id={name}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                style={error ? { borderColor: 'red' } : {}}
            />
            <span style={{
                color: 'red',
                fontSize: '14px',
                marginTop: '4px',
                display: 'block',
                minHeight: '20px'
            }}>
                {error || '\u00A0'}
            </span>
        </div>
    );
};
export default FormField;