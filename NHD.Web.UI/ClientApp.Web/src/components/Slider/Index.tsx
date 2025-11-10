import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

interface SliderProps {
    sliderData: any[];
}

const Slider: React.FC<SliderProps> = ({ sliderData }) => {
    if (!sliderData || sliderData.length === 0) return null; // or show a loader
    console.log("Slider Data:", sliderData);

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
                        style={{ backgroundImage: `url(${(process.env.REACT_APP_BASE_URL || "") + `/uploads/sections/${slide.imageUrl}`})` }}
                    >
                        <div className="container">
                            <div className="slider-content text-center mx-auto">
                                <h1 className="slider-content__title text-white">{slide.titleEn}</h1>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Slider;
