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
    <section className="flat-spacing-1 pt_0">
      <div className="container">
        <div className="flat-title">
          <span className="title">Services in this category</span>
        </div>
        <div className="hover-sw-nav hover-sw-2">
          <Swiper
            dir="ltr"
            className="swiper tf-sw-product-sell wrap-sw-over"
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
              <SwiperSlide key={i} className="swiper-slide">
                <Shopcard28 product={product} />
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
        </div>
      </div>
    </section>
  );
}
