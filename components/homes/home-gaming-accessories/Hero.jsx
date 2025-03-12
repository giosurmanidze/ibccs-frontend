"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useEffect, useState } from "react";

export default function Hero({ pageContent }) {
  const banner_cards = pageContent?.banner_cards || [];
  const banner_buttons = pageContent?.banner_buttons || [];
  const banner_bg_image = pageContent?.banner_bg?.value;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="flat-spacing-5 slider-gaming-accessories position-relative">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          zIndex: 1,
        }}
      ></div>

      <Image
        alt="collection-img"
        src={banner_bg_image}
        width={2000}
        height={855}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        {isClient && (
          <Swiper
            spaceBetween={30}
            slidesPerView={3}
            loop={true}
            centeredSlides={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: ".custom-pagination",
              bulletClass: "custom-bullet",
              bulletActiveClass: "custom-bullet-active",
            }}
            navigation={true}
            breakpoints={{
              1200: { slidesPerView: 3, spaceBetween: 30 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              0: { slidesPerView: 1, spaceBetween: 20 },
            }}
            className="swiper tf-sw-recent"
            dir="ltr"
            modules={[Autoplay, Pagination, Navigation]}
          >
            {banner_cards.map((slide, index) => {
              const correspondingButton =
                banner_buttons[index] || banner_buttons[0];

              console.log(correspondingButton);

              return (
                <SwiperSlide key={index}>
                  <div
                    className="card-container"
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      margin: "0 auto",
                      borderRadius: "10px",
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    }}
                  >
                    {correspondingButton?.banner_img?.value && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Image
                          alt={slide.alt || "Card image"}
                          src={correspondingButton.banner_img.value}
                          fill
                          style={{
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background:
                              "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))",
                            zIndex: 1,
                          }}
                        ></div>
                      </div>
                    )}

                    <div
                      className="collection-content text-center"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        padding: "2rem",
                        zIndex: 2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        height: "100%",
                      }}
                    >
                      <div>
                        <p
                          className="subheading"
                          style={{
                            color: slide.top_text_color?.value || "#ffffff",
                            margin: "0 0 0.5rem",
                            fontSize: "0.9rem",
                            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                          }}
                        >
                          {slide.top_text?.value}
                        </p>
                        <h5
                          className="heading fw-6 font-readex-pro"
                          style={{
                            color: slide.header_text_color?.value || "#ffffff",
                            margin: "0 0 0.5rem",
                            fontSize: "1.5rem",
                            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                          }}
                        >
                          {slide.header_text?.value}
                        </h5>
                        <p
                          className="subtext"
                          style={{
                            color: slide.smaller_text_color?.value || "#ffffff",
                            margin: "0 0 1.5rem",
                            fontSize: "0.85rem",
                            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                          }}
                        >
                          {slide.smaller_text?.value}
                        </p>
                      </div>
                      {correspondingButton && (
                        <div style={{ textAlign: "center" }}>
                          <Link
                            href={
                              correspondingButton.url || "/shop-collection-sub"
                            }
                            className="tf-btn style-3 fw-6 btn-light-icon radius-3 animate-hover-btn"
                            style={{
                              color: correspondingButton.text_color,
                              backgroundColor:
                                correspondingButton.background_color,
                              display: "inline-block",
                              padding: "0.6rem 1.8rem",
                              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            }}
                          >
                            <span>{correspondingButton.text}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}

        <div
          className="custom-pagination"
          style={{
            position: "absolute",
            bottom: "20px",
            left: "0",
            right: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        ></div>
      </div>

      <style jsx global>{`
        .custom-bullet {
          width: 10px;
          height: 10px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          display: inline-block;
          margin: 0 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .custom-bullet-active {
          background-color: white;
          width: 12px;
          height: 12px;
        }

        /* Ensure consistent card sizes */
        .swiper-slide {
          height: auto !important;
        }

        /* Text responsiveness */
        @media (max-width: 768px) {
          .heading {
            font-size: 1.3rem !important;
          }

          .subheading,
          .subtext {
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </section>
  );
}
