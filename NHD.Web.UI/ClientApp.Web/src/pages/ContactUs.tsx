import React, { useEffect, useState } from "react";
import Header from "../components/Common/Header/Index";
import Footer from "../components/Common/Footer/Index";
import contactService from "../api/contactService";
import { ContactMessage, LookupItem } from "../api/common/Types";
import { showAlert, validateEmail } from "../api/common/Utils";
import FormField from "../components/Common/FormField/Index";
import Loader from "../components/Common/Loader/Index";

const ContactUs: React.FC = () => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const [formData, setFormData] = useState<ContactMessage>({
        subjectId: 0,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [subjects, setSubjects] = useState<LookupItem[]>([]);

    // preload image
    useEffect(() => {
        const img = new Image();
        img.src = "/assets/images/banner/contact-us-banner.webp";
        img.onload = () => setImageLoaded(true);
    }, []);

    // generic change handler (input + select + textarea)
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));

        // live error clearing
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };


    const validateForm = () => {
        const validationErrors: { [key: string]: string } = {};

        if (!formData.subjectId || formData.subjectId === 0)
            validationErrors.subjectId = "Subject is required";

        if (!formData.firstName.trim())
            validationErrors.firstName = "First name is required";

        if (!formData.lastName.trim())
            validationErrors.lastName = "Last name is required";

        if (!formData.phone.trim())
            validationErrors.phone = "Phone number is required";

        if (!formData.email.trim())
            validationErrors.email = "Email is required";
        else if (!validateEmail(formData.email))
            validationErrors.email = "Please enter a valid email";

        if (!formData.message.trim())
            validationErrors.message = "Message is required";

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        contactService
            .submitContact(formData)
            .then(() => {
                setLoading(false);
                showAlert("success", "Your message has been sent successfully, an email confirmation has been sent to you.");

                setFormData({
                    subjectId: 0,
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    message: ""
                });

                setErrors({});
            })
            .catch(err => {
                setLoading(false);
                console.error("Error submitting contact form:", err);
                showAlert(
                    "error",
                    "There was an error sending your message. Please try again later."
                );
            });
    };

    // load subjects
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await contactService.getSubjects();
                if (response?.data) setSubjects(response.data);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };
        fetchSubjects();
    }, []);

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

            <div className="section-padding-03 contact-section2 contact-section2_bg">
                <div className="container custom-container">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="contact-section2_content">
                                <h2 className="contact-section2__title">
                                    Information
                                </h2>
                                <p className="contact-section2__text">
                                    For further information, please do not
                                    hesitate to contact us via the form or the
                                    contact details below.
                                </p>
                                <ul className="contact-section2_list">
                                    <li>
                                        <span className="contact-section2_list__icon">
                                            <i className="lastudioicon lastudioicon-pin-3-2" />
                                        </span>
                                        <span className="contact-section2_list__text">
                                            Kölgatan 3  216 47 limhamn Sweden
                                        </span>
                                    </li>
                                    <li>
                                        <span className="contact-section2_list__icon">
                                            <i className="lastudioicon lastudioicon-phone-2" />
                                        </span>
                                        <span className="contact-section2_list__text">
                                            +46 72 048 83 96
                                        </span>
                                    </li>
                                    <li>
                                        <span className="contact-section2_list__icon">
                                            <i className="lastudioicon lastudioicon-mail" />
                                        </span>
                                        <span className="contact-section2_list__text">
                                            Info@nawahomeofdates.com
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="contact-section2_formbg">
                                <h2 className="contact-section2_form__title">
                                    What’s on your mind?
                                </h2>

                                <form
                                    className="contact-section2_form"
                                    onSubmit={handleSubmit}
                                >
                                    <div className="row">
                                        {/* Subject */}
                                        <div className="col-12 form-p">
                                            <div className="form-group">
                                                <label>Subject*</label>
                                                <select
                                                    className="form-field select-input-style"
                                                    name="subjectId"
                                                    value={formData.subjectId}
                                                    onChange={handleChange}
                                                >
                                                    <option value={0}>
                                                        Select a subject
                                                    </option>
                                                    {subjects.map(s => (
                                                        <option
                                                            key={s.id}
                                                            value={s.id}
                                                        >
                                                            {s.nameEn}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.subjectId && (
                                                    <small className="text-danger">
                                                        {errors.subjectId}
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        {/* First Name */}
                                        <div className="col-sm-6 col-6 form-p">
                                            <FormField
                                                label="First Name"
                                                name="firstName"
                                                value={formData.firstName}
                                                error={errors.firstName}
                                                onChange={handleChange}
                                                placeholder="Enter first name"
                                                required
                                            />
                                        </div>

                                        {/* Last Name */}
                                        <div className="col-sm-6 col-6 form-p">
                                            <FormField
                                                label="Last Name"
                                                name="lastName"
                                                value={formData.lastName}
                                                error={errors.lastName}
                                                onChange={handleChange}
                                                placeholder="Enter last name"
                                                required
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="col-sm-6 col-6 form-p">
                                            <FormField
                                                label="Email"
                                                name="email"
                                                value={formData.email}
                                                error={errors.email}
                                                onChange={handleChange}
                                                placeholder="Enter email address"
                                                required
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="col-sm-6 col-6 form-p">
                                            <FormField
                                                label="Phone"
                                                name="phone"
                                                value={formData.phone}
                                                error={errors.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone number"
                                                required
                                            />
                                        </div>

                                        {/* Message textarea - fixed */}
                                        <div className="col-md-12 form-p">
                                            <div className="form-group">
                                                <label>Message*</label>
                                                <textarea
                                                    className="form-control text-area"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Enter your message"
                                                />
                                                {errors.message && (
                                                    <small className="text-danger">
                                                        {errors.message}
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="col-md-12 form-p">
                                            <div className="form-group mb-0 d-flex justify-content-center">
                                                <button
                                                    className="btn btn-secondary btn-hover-primary"
                                                    type="submit"
                                                >
                                                    Send Message
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer isDark />
        </>
    );
};

export default ContactUs;
