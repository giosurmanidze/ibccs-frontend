"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Shopcard28 from "../shopCards/ProductCard28";
import { useGetCategory } from "@/hooks/useCategory";
import { useSearchParams } from "next/navigation";

export default function Products() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const { data } = useGetCategory(categoryId);
  return (
    <section className="flat-spacing-1 mt-20!">
      <div className="container">
        <div className="flat-title mb-8 md:mb-12 text-center md:text-left">
          <span
            className="title fw-6 font-readex-pro text_black-3 text-2xl md:text-3xl lg:text-4xl block mb-2"
            data-wow-delay="0s"
          >
            Services in this category
          </span>
          <div className="title-underline bg-gray-200 h-1 w-20 mx-auto md:mx-0">
            <div
              className="title-indicator h-1 w-10"
              style={{
                backgroundColor: "#5ca595",
              }}
            ></div>
          </div>
        </div>
        <div className="wrap-carousel relative">
          <Swiper
            dir="ltr"
            className="tf-sw-product-sell wrap-sw-over"
            slidesPerView={4}
            spaceBetween={30}
            breakpoints={{
              1024: {
                slidesPerView: 4,
              },
              640: {
                slidesPerView: 3,
              },
              0: {
                slidesPerView: 2,
                spaceBetween: 15,
              },
            }}
            modules={[Navigation, Pagination]}
            navigation={{
              prevEl: ".snbp3070",
              nextEl: ".snbn3070",
            }}
            pagination={{ clickable: true, el: ".spd307" }}
          >
            {data?.services.map((product, i) => (
              <SwiperSlide key={i} className="h-auto w-[300px]">
                <div className="px-1 py-2 h-full w-full">
                  <Shopcard28 product={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nav-sw nav-next-slider nav-next-product box-icon w_46 round snbp3070">
            <span className="icon icon-arrow-left" />
          </div>
          <div className="nav-sw nav-prev-slider nav-prev-product box-icon w_46 round snbn3070">
            <span className="icon icon-arrow-right" />
          </div>
          <div className="sw-dots style-2 sw-pagination-product justify-content-center spd307" />
        </div>{" "}
        {(!data || data.length === 0) && (
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
