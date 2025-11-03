import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "primary",
    showIcon = true,
    size = "md"
}) => {
    if (!open) return null;

    const styles = {
        backdrop: {
            position: 'fixed' as const,
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)'
        },
        dialog: {
            position: 'relative' as const,
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '100%',
            margin: '0 16px',
            maxWidth:
                size === 'sm'
                    ? '384px'
                    : size === 'md'
                        ? '448px'
                        : size === 'lg'
                            ? '512px'
                            : '576px',
            transform: 'scale(1)',
            transition: 'all 0.2s ease-out'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 24px 16px',
            borderBottom: '1px solid #f3f4f6'
        },
        headerContent: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        title: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            margin: 0
        },
        closeButton: {
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
        },
        content: {
            padding: '0 24px 16px'
        },
        message: {
            color: '#6b7280',
            lineHeight: 1.6,
            margin: 0,
            fontSize: '14px'
        },
        actions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px 24px',
            backgroundColor: '#f9fafb',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px'
        },
        button: {
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            minWidth: '80px'
        },
        cancelButton: {
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #d1d5db'
        },
        confirmButton: {
            color: 'white',
            border: 'none'
        }
    };

    const getConfirmButtonColor = (variant: string) => {
        switch (variant) {
            case 'danger':
                return { backgroundColor: '#dc2626', hoverColor: '#b91c1c' };
            case 'success':
                return { backgroundColor: '#059669', hoverColor: '#047857' };
            case 'warning':
                return { backgroundColor: '#d97706', hoverColor: '#b45309' };
            default:
                return { backgroundColor: '#2563eb', hoverColor: '#1d4ed8' };
        }
    };

    const { backgroundColor, hoverColor } = getConfirmButtonColor(confirmVariant);
    const [confirmBg, setConfirmBg] = React.useState(backgroundColor);

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div
                style={styles.dialog}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-description"
            >
                <div style={styles.header}>
                    <div style={styles.headerContent}>
                        {showIcon && <AlertTriangle size={24} style={{ color: '#f59e0b' }} />}
                        <h2 id="dialog-title" style={styles.title}>{title}</h2>
                    </div>
                    <button
                        style={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close dialog"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.color = '#4b5563';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#9ca3af';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={styles.content}>
                    <p id="dialog-description" style={styles.message}>{message}</p>
                </div>

                <div style={styles.actions}>
                    {/* ✅ Only render Cancel if cancelText is provided */}
                    {cancelText ? (
                        <button
                            style={{ ...styles.button, ...styles.cancelButton }}
                            onClick={onClose}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                            {cancelText}
                        </button>
                    ) : null}

                    <button
                        style={{ ...styles.button, ...styles.confirmButton, backgroundColor: confirmBg }}
                        onClick={onConfirm}
                        autoFocus
                        onMouseEnter={() => setConfirmBg(hoverColor)}
                        onMouseLeave={() => setConfirmBg(backgroundColor)}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
