import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import homeService from "../../api/homeService";
import { BrandItem } from "../../api/common/Types";



const Brands: React.FC = () => {
    const [brandsData, setBrandsData] = React.useState<BrandItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await homeService.getBrands();

                // Make sure it's an array before mapping
                if (Array.isArray(response)) {
                    const mapped = response.map((brand: any) => ({
                        id: brand.id,
                        nameEn: brand.nameEn,
                        nameSv: brand.nameSv,
                        imageUrl: (process.env.REACT_APP_BASE_URL || "") + `/uploads/dates/${brand.imageUrl}`,
                        altText: brand.altText,
                    }));

                    setBrandsData(mapped);
                } else {
                    setBrandsData([]);
                    console.warn("Brands response is not an array:", response);
                }

            } catch (error) {
                console.error("Error fetching brands:", error);
                setBrandsData([]);
            }
        };

        fetchData();
    }, []);

    if (!brandsData.length) return null;

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
                    {brandsData.map((brand) => (
                        <SwiperSlide key={brand.id}>
                            <div className="brand-item flex justify-center">
                                <img
                                    src={brand.imageUrl}
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
