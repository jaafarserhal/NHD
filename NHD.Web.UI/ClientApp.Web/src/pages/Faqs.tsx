import { use, useEffect, useState } from "react";
import FaqItem from "../components/FaqItem/Index";
import Footer from "../components/Common/Footer/Index";
import Loader from "../components/Common/Loader/Index";
import Header from "../components/Common/Header/Index";
import faqService from "../api/faqService";
import { useNavigate, useParams } from "react-router-dom";
import { FAQ } from "../api/common/Types";

export default function Faqs() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    // preload image
    useEffect(() => {
        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, []);
    const { typeId, typeName } = useParams();
    const navigate = useNavigate();

    const [faqsData, setFaqsData] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFaqs = async () => {
        try {
            setError(null);

            // validate params
            if (!typeId || !typeName) {
                setError("Missing FAQ category information.");
                return;
            }

            // ensure numeric typeId
            if (isNaN(Number(typeId))) {
                setError("Invalid FAQ category identifier.");
                return;
            }

            setLoading(true);
            const data = await faqService.getFAQsByType(typeId);
            setFaqsData(data.data);

            if (!data.data || data.data.length === 0) {
                setError("No FAQs found for this category.");
            }

        } catch (err) {
            setError("Failed to load FAQs. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, [typeId, typeName]);


    return (
        <>
            <Loader loading={loading} />
            <Header />
            <div
                className="breadcrumb"
                style={{
                    backgroundImage:
                        "url(/assets/images/banner/contact-us-banner.webp)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: imageLoaded ? 1 : 0.9,
                    transition: "opacity 0.3s ease-in-out"
                }}
            />

            <div className="contact-section2 contact-section2_bg" style={{ padding: '40px' }}>
                <div className="container custom-container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="contact-section2_content">
                                <h2 className="contact-section2__title" style={{ textAlign: 'center' }}>
                                    Frequently Asked Questions - {faqsData.length > 0 ? faqsData[0].type : typeName?.replace('-', ' ')}
                                </h2>
                                <div style={{ borderTop: '2px solid #cccccc', marginTop: '20px', paddingTop: '20px' }}>
                                    {error && (
                                        <p style={{ textAlign: "center", color: "red", marginTop: "10px" }}>
                                            {error}
                                        </p>
                                    )}

                                    {!error && faqsData.map((faq, index) => (
                                        <FaqItem
                                            key={index}
                                            question={faq.questionEn}
                                            answer={faq.answerEn}
                                            isOpen={openIndex === index}
                                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer isDark />
        </>
    );
};
