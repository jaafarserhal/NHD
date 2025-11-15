import React, { useState } from "react";

interface SubscribeProps {
    informativeData: any[];
}

export default function Subscribe({ informativeData }: SubscribeProps) {

    if (!informativeData || informativeData.length === 0) return null;

    const section = informativeData[0];
    const [email, setEmail] = useState("");

    const handleSubscribe = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        console.log("Subscribed:", email);
    };

    return (
        <div
            className="newsletter-section bg-cover bg-center"
            style={{ backgroundImage: `url(${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${section.imageUrl})` }}
        >
            <div className="container mx-auto py-16">
                <div className="newsletter text-center">
                    <h2 className="newsletter__title text-white text-3xl font-semibold mb-6">
                        {section.titleEn}
                    </h2>

                    <form
                        className="newsletter__form flex justify-center gap-4"
                        onSubmit={handleSubscribe}
                    >
                        <input
                            className="newsletter__field px-4 py-2 rounded-xl w-72"
                            type="email"
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="newsletter__btn px-6 py-2 rounded-xl bg-white text-black font-medium hover:opacity-80 transition"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
