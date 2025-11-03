import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import productService from "../../api/productService";

interface SliderItem {
    backgroundImage: string;
    title: string;
}

const Slider: React.FC = () => {
    const [sliderData, setSliderData] = useState<SliderItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await productService.getCarouselProducts();

                // Make sure it's an array before mapping
                if (Array.isArray(response)) {
                    const mapped = response.map((product: any) => ({
                        backgroundImage: (process.env.REACT_APP_BASE_URL || "") + `/uploads/products/${product.imageUrl}`,
                        title: product.nameEn,
                    }));

                    setSliderData(mapped);
                } else {
                    setSliderData([]);
                    console.warn("Carousel response is not an array:", response);
                }

            } catch (error) {
                console.error("Error fetching carousel products:", error);
                setSliderData([]);
            }
        };

        fetchData();
    }, []);

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
                            <div className="slider-content text-center mx-auto">
                                <h1 className="slider-content__title text-white">{slide.title}</h1>
                                <a className="slider-content__btn btn btn-primary btn-hover-black">
                                    Order Now
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
