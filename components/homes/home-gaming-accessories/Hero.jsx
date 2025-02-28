"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Hero({ pageContent }) {
  const banner_buttons = pageContent?.banner_buttons;
  const banner_bg_image = pageContent?.banner_bg?.value;
  console.log(pageContent);

  return (
    <section className=" flat-spacing-5 slider-gaming-accessories">
      <Image
        className="lazyload"
        data-src={banner_bg_image}
        alt="collection-img"
        src={banner_bg_image}
        width={2000}
        height={855}
      />
      <div className="container">
        <Swiper
          spaceBetween={15}
          breakpoints={{
            768: { slidesPerView: 2, spaceBetween: 30 },
            0: { slidesPerView: 1.3 },
          }}
          className="swiper tf-sw-recent"
          dir="ltr"
        >
          {pageContent.banner_cards?.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="collection-item-v4 style-2 hover-img">
                <div className="collection-inner">
                  {banner_buttons && banner_buttons[index] && (
                    <Link
                      href={`/shop-collection-sub`}
                      className="collection-image img-style radius-10 o-hidden"
                    >
                      <Image
                        className="lazyload"
                        data-src={slide.imgSrc}
                        alt={slide.alt}
                        src={banner_buttons[index]?.banner_img?.value}
                        width={800}
                        height={747}
                      />
                    </Link>
                  )}
                  <div
                    className="collection-content text-start wow fadeInUp"
                    data-wow-delay="0s"
                  >
                    <p
                      className="subheading"
                      style={{ color: slide.top_text_color.value }}
                    >
                      {slide.top_text.value}
                    </p>
                    <h5
                      className="heading fw-6 font-readex-pro"
                      style={{ color: slide.header_text_color.value }}
                    >
                      {slide.header_text.value}
                    </h5>
                    <p
                      className="subtext"
                      style={{ color: slide.smaller_text_color.value }}
                    >
                      {slide.smaller_text.value}
                    </p>
                    {banner_buttons && banner_buttons[index] && (
                      <Link
                        href={`/shop-collection-sub`}
                        className="tf-btn style-3 fw-6 btn-light-icon radius-3 animate-hover-btn"
                        style={{
                          color: banner_buttons[index]?.text_color,
                          backgroundColor:
                            banner_buttons[index]?.background_color,
                        }}
                      >
                        <span>{banner_buttons[index]?.text}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
