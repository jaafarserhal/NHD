import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import homeService from "../../api/homeService";
import { BrandItem } from "../../api/common/Types";

interface BrandsProps {
    brands?: BrandItem[];
}

const Brands: React.FC<BrandsProps> = ({ brands }) => {


    if (!brands || !brands.length) return null;

    return (
        <div className="brand-section py-8">
            <div className="container">
                <Swiper
                    modules={[Autoplay]}
                    slidesPerView={5}
                    spaceBetween={20}
                    loop={true}
                    autoplay={{ delay: 2500, disableOnInteraction: false }}
                >
                    {brands.map((brand) => (
                        <SwiperSlide key={brand.id}>
                            <div className="brand-item flex justify-center">
                                <img
                                    src={(process.env.REACT_APP_BASE_URL || "") + `/uploads/dates/${brand.imageUrl}`}
                                    alt={brand.altText}
                                    loading="lazy"
                                    className="max-h-20 object-contain"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default Brands;
