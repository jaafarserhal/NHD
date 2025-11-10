import React from "react";
import homeService from "../../api/homeService";

const CallToActionSection: React.FC = () => {
    const [sectionData, setSectionData] = React.useState<any | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ response IS the SectionViewModel object
                const response = await homeService.getCallToActionSection();
                setSectionData(response);
            } catch (error) {
                console.error("Error fetching call to action section:", error);
            }
        };

        fetchData();
    }, []);

    if (!sectionData) return null; // or show a loader

    return (
        <section
            className="call-to-action"
            style={{
                backgroundImage: `url(${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${sectionData[0].imageUrl})`,
            }}
        >
            <div className="container">
                <div className="row align-items-center gy-8 gx-0">
                    {/* Left Content */}
                    <div className="col-lg-6">
                        <div className="call-to-action-box">
                            <h3 className="call-to-action-box__title text-white">
                                <span>{sectionData[0].titleEn}</span>
                            </h3>
                            <p className="call-to-action-box__text text-white">
                                {sectionData[0].descriptionEn}
                            </p>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="col-lg-6">
                        <div className="call-to-action-more text-center position-relative">
                            <a className="call-to-action-more__arrow text-white lh-1" href="contact.html">
                                <i className="lastudioicon-arrow-right"></i>
                            </a>
                            <div className="position-absolute top-50 start-50 translate-middle">
                                <img
                                    className="call-to-action-more__svg"
                                    src="assets/images/svg-text.svg"
                                    alt="Svg Text"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CallToActionSection;
