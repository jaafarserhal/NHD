import React, { ReactNode, useEffect } from "react";
import styles from "./index.module.css";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    id?: string;
    children: ReactNode;
    className?: string;
}

const PromptModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    id = "modal",
    children,
    className = "",
}) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            id={id}
            className={`quickview-product-modal modal fade show  ${className}`}
            style={{ display: "block" }}
            role="dialog"
            aria-modal="true"
        >
            <div className={`modal-dialog modal-dialog-centered mw-100 ${styles.promptModal}`}>
                <div className="custom-content">
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <i className="lastudioicon lastudioicon-e-remove"></i>
                    </button>

                    <div className="modal-body">{children}</div>
                </div>
            </div>

            {/* backdrop */}
            <div className="modal-backdrop fade show" onClick={onClose} />
        </div>
    );
};

export default PromptModal;
