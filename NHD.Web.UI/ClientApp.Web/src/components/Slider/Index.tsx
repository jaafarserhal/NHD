import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

interface SliderProps {
    sliderData: any[];
}

const Slider: React.FC<SliderProps> = ({ sliderData }) => {
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

    // Preload all slider images
    useEffect(() => {
        if (!sliderData || sliderData.length === 0) return;

        sliderData.forEach((slide, index) => {
            const imageUrl = `${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${slide.imageUrl}`;
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                setLoadedImages(prev => new Set(prev).add(index));
            };
        });
    }, [sliderData]);

    if (!sliderData || sliderData.length === 0) return null;

    const getImageUrl = (imageUrl: string) => {
        return `${(process.env.REACT_APP_BASE_URL || "")}/uploads/sections/${imageUrl}`;
    };

    return (
        <div className="slider-section slider-active overflow-hidden">
            <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                loop={true}
                className="swiper"
            >
                {sliderData.map((slide, index) => {
                    const imageUrl = getImageUrl(slide.imageUrl);
                    const isLoaded = loadedImages.has(index);

                    return (
                        <SwiperSlide
                            key={index}
                            className="single-slider swiper-slide animation-style-01"
                            style={{
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                opacity: isLoaded ? 1 : 0.9,
                                transition: 'opacity 0.3s ease-in-out'
                            }}
                        >
                            <div className="container">
                                <div className="slider-content text-center mx-auto">
                                    <h1 className="slider-content__title text-white">
                                        {slide.titleEn}
                                    </h1>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default Slider;