import React, { useEffect, useState } from "react";
import Header from "../components/Common/Header/Index";
import Footer from "../components/Common/Footer/Index";

const ContactUs: React.FC = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    useEffect(() => {
        const img = new Image();
        img.src = '/assets/images/banner/contact-us-banner.webp';
        img.onload = () => setImageLoaded(true);
    }, []);
    return (
        <>
            {/* Breadcrumb Section Start */}
            <Header />
            <div
                className="breadcrumb"
                style={{
                    backgroundImage: "url(/assets/images/banner/contact-us-banner.webp)",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: imageLoaded ? 1 : 0.9,
                    transition: 'opacity 0.3s ease-in-out'
                }}
            >
            </div>
            {/* Breadcrumb Section End */}

            {/* Contact form section Start */}
            <div className="section-padding-03 contact-section2 contact-section2_bg">
                <div className="container custom-container">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="contact-section2_content">
                                <h2 className="contact-section2__title">Information</h2>
                                <p className="contact-section2__text">
                                    Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate
                                    exercitation incididunt
                                </p>
                                <ul className="contact-section2_list">
                                    {/* <li>
                                        <span className="contact-section2_list__icon">
                                            <i className="lastudioicon lastudioicon-pin-3-2" />
                                        </span>
                                        <span className="contact-section2_list__text">
                                            6391 Elgin St. Celina, Delaware 10299 <br /> 2464 Royal Ln. Mesa, New Jersey 45463
                                        </span>
                                    </li> */}
                                    <li>
                                        <span className="contact-section2_list__icon">
                                            <i className="lastudioicon lastudioicon-phone-2" />
                                        </span>
                                        <span className="contact-section2_list__text">
                                            +880-123-456789 <br /> +880-123-456789
                                        </span>
                                    </li>
                                    <li>
                                        <span className="contact-section2_list__icon">
                                            <i className="lastudioicon lastudioicon-mail" />
                                        </span>
                                        <span className="contact-section2_list__text">
                                            info@admin.com <br /> test.mail.com
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="contact-section2_formbg">
                                <h2 className="contact-section2_form__title">Say Something...</h2>

                                <form
                                    className="contact-section2_form"
                                    id="contact-form"
                                    action="assets/php/mail.php"
                                    method="post"
                                >
                                    <div className="row">
                                        <div className="col-sm-6 col-6 form-p">
                                            <div className="form-group">
                                                <label>First Name*</label>
                                                <input className="form-field" type="text" name="name" />
                                            </div>
                                        </div>

                                        <div className="col-sm-6 col-6 form-p">
                                            <div className="form-group">
                                                <label>Last Name*</label>
                                                <input className="form-field" type="text" name="lastname" />
                                            </div>
                                        </div>

                                        <div className="col-md-12 form-p">
                                            <div className="form-group">
                                                <label>Email Address*</label>
                                                <input className="form-field" type="email" name="email" />
                                            </div>
                                        </div>

                                        <div className="col-md-12 form-p">
                                            <div className="form-group">
                                                <label>Message*</label>
                                                <textarea className="form-control text-area" name="message" />
                                            </div>
                                        </div>

                                        <div className="col-md-12 form-p">
                                            <div className="form-group mb-0 d-flex justify-content-center">
                                                <button className="btn btn-secondary btn-hover-primary" type="submit" value="Send Message">
                                                    Send Message
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Message Notification */}
                                <div className="form-messege" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Contact form section End */}
            <Footer isDark={true} />
        </>
    );
};

export default ContactUs;
