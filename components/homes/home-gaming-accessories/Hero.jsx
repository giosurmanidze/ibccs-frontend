"use client";

import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState } from "react";

export default function Hero({ pageContent }) {
  const banner_cards = pageContent?.banner_cards || [];
  const banner_buttons = pageContent?.banner_buttons || [];
  const banner_bg_image = pageContent?.banner_bg?.value;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '30px',
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          centerPadding: '30px'
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          centerPadding: '30px'
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerPadding: '20px'
        }
      }
    ],
    customPaging: (i) => (
      <div className="custom-dot"></div>
    )
  };

  return (
    <section className="flat-spacing-5 slider-gaming-accessories position-relative">
      {/* Background overlay */}
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

      {/* Background Image */}
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
          <Slider {...sliderSettings}>
            {banner_cards.map((slide, index) => {
              // Find the corresponding button for this card
              const correspondingButton =
                banner_buttons[index] || banner_buttons[0];

              return (
                <div key={index} className="px-2">
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
                    {/* Image background */}
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
                        {/* Dark overlay for better text readability */}
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

                    {/* Content overlay (positioned above the image) */}
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
                </div>
              );
            })}
          </Slider>
        )}
      </div>

      {/* Add custom CSS for pagination bullets */}
      <style jsx global>{`
        /* Custom dot styles */
        .slick-dots li {
          margin: 0 5px;
        }

        .custom-dot {
          width: 10px;
          height: 10px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          display: inline-block;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .slick-dots li.slick-active .custom-dot {
          background-color: white;
          width: 12px;
          height: 12px;
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