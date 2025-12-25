import React, { useEffect, useState } from "react";
import homeService from "../../api/homeService";
import { showAlert } from "../../api/common/Utils";

interface SubscribeProps {
    informativeData: any[];
}

export default function Subscribe({ informativeData }: SubscribeProps) {
    if (!informativeData || informativeData.length === 0) return null;

    const section = informativeData[0];
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
    useEffect(() => {
        if (section?.imageUrl) {
            const img = new Image();
            img.src = `${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${section.imageUrl}`;
            img.onload = () => setBannerImageLoaded(true);
        }
    }, [section?.imageUrl]);

    const validateEmail = (value: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    };

    const handleSubscribe = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!email) {
            setError("*Email Address is required");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }
        setError("");

        setLoading(true);

        try {
            await homeService.subscribeEmail(email);

            showAlert("success", "Subscribed successfully!");

            setEmail("");
        } catch (err) {
            showAlert("error", (err as any)?.data || "An error occurred");
        }

        setLoading(false);
    };

    return (
        <div
            className="newsletter-section bg-cover bg-center"
            style={{
                backgroundImage: `url(${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${section.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: bannerImageLoaded ? 1 : 0.9,
                transition: 'opacity 0.3s ease-in-out'
            }}
        >
            <div className="container mx-auto py-16 overflow-visible">
                <div className="newsletter text-center">
                    <h2 className="newsletter__title text-white text-3xl font-semibold mb-6">
                        {section.titleEn}
                    </h2>

                    <form
                        className="newsletter__form flex justify-center gap-4"
                        onSubmit={handleSubscribe}
                    >
                        <div className="flex flex-col relative">
                            <input
                                className="newsletter__field px-4 py-2 rounded-xl w-72"
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError("");
                                }}
                            />

                            {/* Smooth error message */}
                            <div className="min-h-[20px] relative" style={{ marginTop: '5px' }}>
                                <span
                                    className={`text-white text-sm absolute transition-opacity duration-300 ${error ? "opacity-100" : "opacity-0"
                                        }`}
                                >
                                    {error || "Placeholder"} {/* Placeholder ensures consistent spacing */}
                                </span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`newsletter__btn px-6 py-2 rounded-xl font-medium transition 
                                ${loading ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-white text-black hover:opacity-80"}
                            `}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Loading...</span>
                                </div>
                            ) : (
                                "Subscribe"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
