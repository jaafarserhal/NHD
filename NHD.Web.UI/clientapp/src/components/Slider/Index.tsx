import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

interface SliderItem {
    backgroundImage: string;
    shapeImage: string;
    shapeWidth: number;
    shapeHeight: number;
    title: string;
    btnText: string;
    btnLink: string;
    customClass?: string;
}

const sliderData: SliderItem[] = [
    {
        backgroundImage: "assets/images/slider/slider-test-01.jpg",
        shapeImage: "assets/images/shape/shape-test-01.png",
        shapeWidth: 95,
        shapeHeight: 108,
        title: "Bring The Best Experience",
        btnText: "Order Now",
        btnLink: "single-product.html",
    },
    {
        backgroundImage: "assets/images/slider/slider-test-02.jpg",
        shapeImage: "assets/images/shape/shape-test-02.png",
        shapeWidth: 95,
        shapeHeight: 62,
        title: "Taste That Lasts Forever",
        btnText: "Order Now",
        btnLink: "single-product.html",
        customClass: "custom-ms-01",
    },
];

const Slider: React.FC = () => {
    return (
        <div className="slider-section slider-active overflow-hidden">
            <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                loop={true}
                className="swiper"
            >
                {sliderData.map((slide, index) => (
                    <SwiperSlide
                        key={index}
                        className="single-slider swiper-slide animation-style-01"
                        style={{ backgroundImage: `url(${slide.backgroundImage})` }}
                    >
                        <div className="container">
                            <div className={`slider-content text-center ${slide.customClass ? slide.customClass : 'mx-auto'}`}>
                                <img
                                    className="slider-content__shape"
                                    width={slide.shapeWidth}
                                    height={slide.shapeHeight}
                                    src={slide.shapeImage}
                                    alt="Shape"
                                />
                                <h1 className="slider-content__title text-white">{slide.title}</h1>
                                <a className="slider-content__btn btn btn-primary btn-hover-black" href={slide.btnLink}>
                                    {slide.btnText}
                                </a>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Slider;