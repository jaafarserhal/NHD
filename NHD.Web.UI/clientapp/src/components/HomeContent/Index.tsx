import { useState } from "react";
import { Product } from "../../api/common/Types";
import Item from "../HomeTopThreeProducts/Item";

const HomeContent: React.FC = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Subscribing email:', email);
        setEmail('');
    };

    const products: Product[] = [
        { id: 1, name: 'Brownie', price: '$4.99', image: 'assets/images/product/product-8-500x625.jpg', isHot: true },
        { id: 2, name: 'Red Velvet', price: '$5.00', image: 'assets/images/product/product-7-500x625.jpg' },
        { id: 3, name: 'Cream Muffin', price: '$7.55', image: 'assets/images/product/product-6-500x625.jpg' },
        { id: 4, name: 'Macaron Cake', price: '$9.44', image: 'assets/images/product/product-5-500x625.jpg' },
        { id: 5, name: 'No-bake chocolate', price: '$4.99', image: 'assets/images/product/product-4-500x625.jpg' },
        { id: 6, name: 'Chocolate Bake', price: '$5.00', image: 'assets/images/product/product-3-500x625.jpg' },
        { id: 7, name: 'Red Velvet', price: '$7.55', image: 'assets/images/product/product-2-500x625.jpg', isHot: true },
        { id: 8, name: 'Italian Loaf', price: '$9.44', image: 'assets/images/product/product-1-500x625.jpg' },
    ];

    return (
        <>
            {/* Call to Action Section Start */}
            <div className="call-to-action" style={{ backgroundImage: 'url(assets/images/call-to-action-bg.jpg)' }}>
                <div className="container">
                    <div className="row align-items-center gy-8 gx-0">
                        <div className="col-lg-6">
                            <div className="call-to-action-box">
                                <h3 className="call-to-action-box__title text-white">
                                    <span>Come with us</span>
                                </h3>
                                <ul className="call-to-action-box__list text-white">
                                    <li>
                                        Aliquam pulvinar vestibulum blandit. Donec sed nisl libero. Fusce dignissim{' '}
                                        <u>luctus sem eu dapibus.</u>
                                    </li>
                                    <li>
                                        Pellentesque vulputate quam a quam volutpat, sed ullamcorper erat commodo. Vestibulum sit amet ipsum vitae mauris mattis vulputate lacinia nec neque.
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="call-to-action-more text-center position-relative">
                                <a className="call-to-action-more__arrow text-white lh-1" href="contact.html">
                                    <i className="lastudioicon-arrow-right"></i>
                                </a>
                                <div className="position-absolute top-50 start-50 translate-middle">
                                    <img className="call-to-action-more__svg" src="assets/images/svg-text.svg" alt="Svg Text" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand Section Start */}
            <div className="brand-section">
                <div className="container">
                    <div className="brand-active">
                        <div className="swiper">
                            <div className="swiper-wrapper align-items-center">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <div key={num} className="swiper-slide brand-item">
                                        <img src={`assets/images/brand/partner-${num}.png`} alt="Brand" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner Section Start */}
            <div className="banner-section">
                <div className="row row-cols-1 row-cols-md-2 g-0">
                    {['Cupcake', 'Pastry', 'Muffin', 'Waffle'].map((item, idx) => (
                        <div key={item} className="col">
                            <a href="shop.html" className="banner-item" style={{ backgroundImage: `url(assets/images/banner-0${idx + 1}.jpg)` }}>
                                <div className="banner-item__content">
                                    <h3 className="banner-item__title text-white">{item}</h3>
                                    <span className="banner-item__btn text-white">Shop Now</span>
                                </div>
                                <div className="banner-item__badge text-white">01.</div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Section Start */}
            <div className="section-padding-01">
                <div className="container">
                    <div className="section-title text-center max-width-720 mx-auto">
                        <h2 className="section-title__title">OUR PRODUCTS</h2>
                        <p>Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillum dolor. Voluptate exercitation incididunt</p>
                    </div>

                    <div className="product-tab-menu pb-8">
                        <ul className="nav justify-content-center">
                            {['All', 'Cupcake', 'Pastry', 'Muffin', 'Waffle', 'Tart'].map((tab, idx) => (
                                <li key={tab}>
                                    <button className={idx === 0 ? 'active' : ''} data-bs-toggle="tab" data-bs-target={`#tab${idx + 1}`}>
                                        {tab}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="tab-content">
                        <div className="tab-pane fade show active" id="tab1">
                            <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1 mb-n50">
                                {products.map((product) => (
                                    <Item key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action Section 2 Start */}
            <div className="call-to-action-02" style={{ backgroundImage: 'url(assets/images/call-to-action-bg-02.jpg)' }}>
                <div className="call-to-action-02-wrapper section-padding-01">
                    <div className="container">
                        <div className="call-to-action-02-content text-center">
                            <h4 className="call-to-action-02-content__sub-title text-primary">Bakerfresh</h4>
                            <h2 className="call-to-action-02-content__title text-white mt-1">The most amazing cakes</h2>
                            <p className="mt-6 text-white">
                                Aliqua id fugiat nostrud irure ex duis ea quis id quis ad et. Sunt qui esse pariatur duis deserunt mollit dolore cillum minim tempor enim
                            </p>
                            <a className="btn btn-outline-white btn-hover-primary" href="shop.html">Shop Now</a>
                        </div>
                    </div>
                </div>

                <div className="call-to-action-02-meta">
                    <div className="container">
                        <div className="row">
                            {[
                                { icon: 'dlicon tech_mobile', text: 'Contact us' },
                                { icon: 'dlicon shopping_bag-09', text: 'Shopping Online' },
                                { icon: 'lastudioicon lastudioicon-pin-3-2', text: 'Store Location' }
                            ].map((item, idx) => (
                                <div key={idx} className="col-md-4">
                                    <div className="call-to-action-02-meta-item text-center">
                                        <a href="shop.html">
                                            <div className="call-to-action-02-meta-item__icon text-primary">
                                                <i className={item.icon}></i>
                                            </div>
                                            <div className="call-to-action-02-meta-item__text text-white">{item.text}</div>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Instagram Section Start */}
            <div className="instagram-section section-padding-01">
                <div className="container">
                    <div className="row gy-6 align-items-center">
                        <div className="col-md-4">
                            <div className="instagram-title">
                                <h2 className="instagram-title__title">INSTAGRAM</h2>
                                <p className="instagram-title__sub-title text-global-color-01">@BakerFreshCakeshop</p>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="instagram-active">
                                <div className="swiper">
                                    <div className="swiper-wrapper">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                            <div key={num} className="swiper-slide instagram-item">
                                                <a href="https://www.instagram.com/">
                                                    <div className="instagram-item__image">
                                                        <img src={`assets/images/instagram/instagram-${num}.jpg`} alt="Instagram" />
                                                    </div>
                                                    <div className="instagram-item__icon">
                                                        <i className="lastudioicon lastudioicon-b-instagram"></i>
                                                    </div>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Newsletter Section Start */}
            <div className="newsletter-section" style={{ backgroundImage: 'url(assets/images/newsletter-bg.jpg)' }}>
                <div className="container">
                    <div className="newsletter text-center">
                        <h2 className="newsletter__title text-white">Stay in touch & get 10% off</h2>
                        <div className="newsletter__form">
                            <div onSubmit={handleSubscribe}>
                                <input
                                    className="newsletter__field"
                                    type="text"
                                    placeholder="Your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button className="newsletter__btn" onClick={handleSubscribe}>Subscribe</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Top */}
            <a href="#" className="scroll-top" id="scroll-top">
                <i className="lastudioicon-up-arrow"></i>
            </a>
        </>
    );
};

export default HomeContent;