"use client";
import { useGetCategories } from "@/hooks/useGetCategories";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Collections() {
  const { data: categories } = useGetCategories();

  return (
    <section className="flat-spacing-10 flat-testimonial">
      <div className="container">
        <div className="flat-title">
          <span
            className="title fw-6 wow fadeInUp font-readex-pro text_black-3"
            data-wow-delay="0s"
          >
            Categories
          </span>
        </div>
        <div className="hover-sw-nav padding-content radius-10">
          <Swiper
            dir="ltr"
            className="swiper tf-sw-testimonial"
            spaceBetween={20}
            breakpoints={{
              1024: { slidesPerView: 4 }, // 4 cards on larger screens
              768: { slidesPerView: 3 }, // 3 cards on medium screens
              480: { slidesPerView: 2 }, // 2 cards on smaller screens
              0: { slidesPerView: 1 }, // 1 card on extra small screens
            }}
            modules={[Pagination, Navigation]}
            pagination={{
              clickable: true,
              el: ".spdcoll1",
            }}
            navigation={{
              prevEl: ".snbpcoll1",
              nextEl: ".snbncoll1",
            }}
          >
            {categories?.map((item, index) => (
              <SwiperSlide key={index}>
                <Link
                  href={`/shop-default?categoryId=${item.id}`}
                  className="card p-3"
                >
                  <span>
                    <Image
                      className="lazyload"
                      data-src={item.imgSrc}
                      alt="collection-img"
                      src={`http://localhost:8000/storage/${item.icon}`}
                      width={60}
                      height={60}
                    />
                  </span>
                  <p class="card__title"> {item.name}</p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nav-sw nav-next-slider nav-next-testimonial lg snbpcoll1">
            <span className="icon icon-arrow-left" />
          </div>
          <div className="nav-sw nav-prev-slider nav-prev-testimonial lg snbncoll1">
            <span className="icon icon-arrow-right" />
          </div>
          <div className="sw-dots style-2 sw-pagination-testimonial justify-content-center spdcoll1" />
        </div>
      </div>
    </section>
  );
}
