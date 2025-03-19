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

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 2,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
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
          arrows: false,
        },
      },
    ],
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  return (
    <section className="hero-section">
      <div className="background-overlay"></div>

      <Image
        src={banner_bg_image}
        alt="collection-img"
        width={2000}
        height={855}
        className="background-image"
        priority
      />

      <div className="container">
        {isClient && (
          <div className="slider-container">
            <Slider {...settings} className="hero-slider">
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
                                color: banner_buttons[buttonIndex]?.text_color,
                                backgroundColor:
                                  banner_buttons[buttonIndex]?.background_color,
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
        )}
      </div>
    </section>
  );
}

function CustomPrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-prev-arrow`}
      onClick={onClick}
    >
      <svg
        width="24"
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
  );
}

function CustomNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-next-arrow`}
      onClick={onClick}
    >
      <svg
        width="24"
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
  );
}