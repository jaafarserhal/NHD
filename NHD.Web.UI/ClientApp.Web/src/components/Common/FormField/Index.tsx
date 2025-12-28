import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
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

    const [showPassword, setShowPassword] = useState(false);

    const isPasswordField = type === 'password';
    const isTelField = type === 'tel';

    const inputType = isPasswordField
        ? (showPassword ? 'text' : 'password')
        : type;

    return (
        <div className="col-12 mt-1">
            <label htmlFor={name}>
                {label} {required && <abbr className="required">*</abbr>}
            </label>

            {/* TEL FIELD SPLIT */}
            {isTelField ? (
                <PhoneInput
                    country={'us'}
                    value={value}
                    onChange={(phone) => {
                        const event = {
                            target: { name, value: phone }
                        } as any;
                        onChange(event);
                    }}
                    inputProps={{
                        name,
                        required,
                    }}
                    enableSearch={true}
                    disableDropdown={false}
                    specialLabel=""
                    containerClass="w-100"
                    inputClass="form-field w-100 tel-input-padding"

                />
            ) : (
                // DEFAULT INPUT (text, password etc.)
                <div style={{ position: 'relative' }}>
                    <input
                        className="form-field"
                        type={inputType}
                        id={name}
                        name={name}
                        value={value}
                        placeholder={placeholder}
                        onChange={onChange}
                        style={error
                            ? { borderColor: 'red', paddingRight: isPasswordField ? '45px' : undefined }
                            : { paddingRight: isPasswordField ? '45px' : undefined }
                        }
                    />

                    {isPasswordField && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666'
                            }}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                // eye-off icon
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                    <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            )}

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
