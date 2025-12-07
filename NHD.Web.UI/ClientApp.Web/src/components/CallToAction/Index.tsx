import React from "react";

interface CallToActionSectionProps {
    callToActionData: any[]; // You can replace `any` with your SectionViewModel type if available
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ callToActionData }) => {
    if (!callToActionData || callToActionData.length === 0) return null; // or show a loader

    const section = callToActionData[0];

    return (
        <section
            className="call-to-action"
            style={{
                backgroundImage: `url(${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${section.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center center'
            }}
        >
            <div className="container">
                <div className="row align-items-center gy-8 gx-0">
                    {/* Left Content */}
                    <div className="col-lg-6">
                        <div className="call-to-action-box">
                            <h3 className="call-to-action-box__title text-white">
                                <span>{section.titleEn}</span>
                            </h3>
                            <p className="call-to-action-box__text text-white">{section.descriptionEn}</p>
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
