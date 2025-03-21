"use client";

import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState, useRef } from "react";

export default function Hero({ pageContent }) {
  const banner_cards = pageContent?.banner_cards || [];
  const banner_buttons = pageContent?.banner_buttons || [];
  const banner_bg_image = pageContent?.banner_bg?.value;
  const [isClient, setIsClient] = useState(false);
  const sliderRef = useRef(null);
  const [sliderHeight, setSliderHeight] = useState(600);
  const sliderContainerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);

    if (sliderContainerRef.current) {
      const updateHeight = () => {
        const cardHeight =
          sliderContainerRef.current?.querySelector(".collection-item")
            ?.offsetHeight || 0;
        if (cardHeight > 0) {
          setSliderHeight(cardHeight);
        }
      };

      // Initial update
      updateHeight();

      // Update on window resize
      window.addEventListener("resize", updateHeight);

      // Also set a timeout to make sure we capture the final rendered height
      setTimeout(updateHeight, 500);

      return () => window.removeEventListener("resize", updateHeight);
    }
  }, [isClient]);

  const goToPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  const goToNext = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 2,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="hero-section">
      <Image
        src={banner_bg_image}
        alt="collection-img"
        width={2200}
        height={855}
        className="background-image"
        priority
      />

      <div className="container">
        {isClient && (
          <div
            className="slider-wrapper"
          >
            <div
              className="side-control left-control"
              onClick={goToPrev}
              aria-label="Previous slide"
              style={{
                height: sliderHeight > 0 ? `${sliderHeight}px` : "auto",
              }}
            >
              <svg
                width="14"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 19L8 12L15 5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="slider-container" ref={sliderContainerRef}>
              <Slider ref={sliderRef} {...settings} className="hero-slider">
                {banner_cards.map((slide, index) => {
                  const buttonIndex = index % banner_buttons.length;
                  return (
                    <div key={index} className="slide-item">
                      <div className="collection-item">
                        <div className="collection-inner">
                          <div className="slide-image-overlay"></div>

                          {banner_buttons[buttonIndex] && (
                            <Link
                              href={`/shop-collection-sub`}
                              className="image-link"
                            >
                              <Image
                                src={
                                  banner_buttons[buttonIndex]?.banner_img?.value
                                }
                                alt={slide.alt || "Collection Image"}
                                width={800}
                                height={650}
                                className="collection-img"
                              />
                            </Link>
                          )}

                          <div className="collection-content">
                            <p
                              className="subheading"
                              style={{ color: slide.top_text_color.value }}
                            >
                              {slide.top_text.value}
                            </p>
                            <h5
                              className="heading"
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
                            {banner_buttons[buttonIndex] && (
                              <Link
                                href={`/shop-collection-sub`}
                                className="button"
                                style={{
                                  color:
                                    banner_buttons[buttonIndex]?.text_color,
                                  backgroundColor:
                                    banner_buttons[buttonIndex]
                                      ?.background_color,
                                }}
                              >
                                {banner_buttons[buttonIndex]?.text}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            </div>
            <div
              className="side-control right-control"
              onClick={goToNext}
              aria-label="Next slide"
              style={{
                height: sliderHeight > 0 ? `${sliderHeight}px` : "auto",
              }}
            >
              <svg
                width="14"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .slider-wrapper {
          display: flex;
          align-items: flex-start;
          position: relative;
          width: 100%;
        }

        .side-control {
          width: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: background-color 0.3s;
          z-index: 5;
          align-self: flex-start;
        }

        .side-control:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }

        .left-control {
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 35px;
          margin-right: 20px;
        }

        .right-control {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 35px;
          margin-left: 20px;
        }

        .slider-container {
          flex: 1;
        }

        /* Add margin to cards so they don't touch the control areas */
        :global(.hero-slider .slick-slide) {
          padding: 0 4px;
        }

        @media (max-width: 768px) {
          .side-control {
            width: 30px;
          }
        }

        @media (max-width: 480px) {
          .side-control {
            width: 25px;
          }
        }
      `}</style>
    </section>
  );
}
