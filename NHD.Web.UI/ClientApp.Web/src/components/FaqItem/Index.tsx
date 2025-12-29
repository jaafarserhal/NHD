import React, { useRef, useEffect, useState } from "react";

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
    index: number;
}

const FaqItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle, index }) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState("0px");

    useEffect(() => {
        if (isOpen && contentRef.current) {
            setHeight(`${contentRef.current.scrollHeight}px`);
        } else {
            setHeight("0px");
        }
    }, [isOpen]);

    return (
        <div>
            <button
                onClick={onToggle}
                style={index !== 0 ? { marginTop: "20px" } : {}}
                className="faq-expand-button"
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        width: "100%",
                    }}
                >
                    {/* circular icon */}
                    <div
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: "9999px",
                            backgroundColor: "#222",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {isOpen ? (
                            <span style={{ fontSize: 18, lineHeight: 0 }}>−</span>
                        ) : (
                            <span style={{ fontSize: 18, lineHeight: 0 }}>+</span>
                        )}
                    </div>

                    {/* question text */}
                    <span
                        style={{
                            fontSize: "16px",
                            fontWeight: 500,
                            color: "#1f2937",
                            display: "block",
                            flex: 1, // stays on the same row
                        }}
                    >
                        {question}
                    </span>
                </div>
            </button>


            {/* Answer with animation */}
            <div
                style={{
                    maxHeight: height,
                    transition: "max-height 300ms ease, opacity 250ms ease",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    marginTop: isOpen ? "20px" : "0px",
                }}
            >
                <div ref={contentRef} className="pb-6 text-gray-700 text-base leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};

export default FaqItem;
