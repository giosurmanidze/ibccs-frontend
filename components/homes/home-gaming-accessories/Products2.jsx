"use client";
import Shopcard28 from "@/components/shopCards/ProductCard28";
import { useGetServices } from "@/hooks/useGetServices";
import React, { useEffect, useState } from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Products2() {
  const { data: products } = useGetServices();
  const [isLoading, setIsLoading] = useState(true);
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
    if (products && products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);

  return (
    <section className="flat-spacing-15 py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flat-title mb-8 md:mb-12 text-center md:text-left">
          <span
            className="title fw-6 font-readex-pro text_black-3 text-2xl md:text-3xl lg:text-4xl block mb-2"
            data-wow-delay="0s"
          >
            Services
          </span>
          <div className="title-underline bg-gray-200 h-1 w-20 mx-auto md:mx-0">
            <div className="title-indicator bg-blue-600 h-1 w-10"></div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {domLoaded && products && products.length > 0 && (
          <div className="wrap-carousel relative">
            <Swiper
              dir="ltr"
              className="tf-sw-product-sell wrap-sw-over"
              breakpoints={{
                1200: {
                  spaceBetween: 30,
                  slidesPerView: 3,
                },
                992: {
                  spaceBetween: 20,
                  slidesPerView: 3,
                },
                768: {
                  spaceBetween: 20,
                  slidesPerView: 2,
                },
                320: {
                  spaceBetween: 15,
                  slidesPerView: 1,
                },
              }}
              modules={[Pagination, Navigation, Autoplay]}
              pagination={{
                clickable: true,
                el: ".spdp2",
              }}
              navigation={{
                prevEl: ".pnbpp21",
                nextEl: ".pnbpn21",
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              loop={products.length > 4}
            >
              {products.map((product, index) => (
                <SwiperSlide key={index} className="h-auto">
                  <div className="px-1 py-2 h-full">
                    <Shopcard28 product={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="navigation-buttons absolute top-1/2 transform -translate-y-1/2 w-full z-10 pointer-events-none">
              <div className="nav-sw nav-next-slider nav-next-sell-1 box-icon w_46 round pnbpp21 absolute -left-12 md:-left-16 pointer-events-auto mr-5">
                <span className="icon icon-arrow-left"></span>
              </div>
              <div className="nav-sw nav-prev-slider nav-prev-sell-1 box-icon w_46 round pnbpn21 absolute -right-12 md:-right-16 pointer-events-auto ml-5">
                <span className="icon icon-arrow-right"></span>
              </div>
            </div>
          </div>
        )}

        {domLoaded && (!products || products.length === 0) && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              No services available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
