import React from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";

export default function Signup() {
    return (<>
        <Header />
        <div className="breadcrumb" style={{ backgroundImage: "url(assets/images/bg/breadcrumb1-bg.jpg)" }}>
        </div>
        <div className="section" style={{ padding: '25px 0' }}>
            <div className="container custom-container">
                <div className="row g-6 justify-center">
                    <div className="col-lg-8 col-12">
                        <h2 className="mb-4">Create New Customer Account</h2>
                        <div className="myaccount-content account-details">
                            <div className="account-details-form">
                                <form>
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <label htmlFor="first-name">
                                                First Name <abbr className="required">*</abbr>
                                            </label>
                                            <input className="form-field" type="text" id="first-name" />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="last-name">
                                                Last Name <abbr className="required">*</abbr>
                                            </label>
                                            <input className="form-field" type="text" id="last-name" />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="phone">
                                                Phone Number <abbr className="required">*</abbr>
                                            </label>
                                            <input className="form-field" type="tel" id="phone" />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="email">
                                                Email Address <abbr className="required">*</abbr>
                                            </label>
                                            <input className="form-field" type="email" id="email" />
                                        </div>

                                        <div className="col-12">
                                            <button className="btn btn-dark btn-primary-hover w-100" type="submit">
                                                Create An Account
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer isDark={true} />
    </>
    );
}
