"use client";
import { useGetCategories } from "@/hooks/useGetCategories";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Collections() {
  const { data: categories } = useGetCategories();

  const PrevArrow = (props) => {
    const { onClick } = props;
    return (
      <div
        className="nav-sw nav-prev-slider nav-prev-testimonial lg snbncoll1"
        onClick={onClick}
      >
        <span className="icon icon-arrow-right" />
      </div>
    );
  };

  const NextArrow = (props) => {
    const { onClick } = props;
    return (
      <div
        className="nav-sw nav-next-slider nav-next-testimonial lg snbpcoll1"
        onClick={onClick}
      >
        <span className="icon icon-arrow-left" />
      </div>
    );
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    appendDots: (dots) => (
      <div className="sw-dots style-2 sw-pagination-testimonial justify-content-center spdcoll1">
        <ul>{dots}</ul>
      </div>
    ),
    customPaging: (i) => <div className="custom-dot"></div>,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

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
          <div className="title-underline bg-gray-200 h-1 w-20 mx-auto md:mx-0">
            <div
              className="title-indicator h-1 w-10"
              style={{
                backgroundColor: "#5ca595",
              }}
            ></div>
          </div>
        </div>
        <div className="hover-sw-nav padding-content radius-10 relative">
          <Slider {...sliderSettings}>
            {categories?.map((item, index) => (
              <div key={index} className="px-2">
                <Link
                  href={`/shop-default?categoryId=${item.id}`}
                  className="card p-3 border-0 shadow-none transition-colors"
                  style={{ transform: "none !important" }}
                >
                  <div className="icon-name">
                    <div className="flex flex-col items-center text-center">
                      <Image
                        className="lazyload"
                        data-src={item.imgSrc}
                        alt="collection-img"
                        src={`${item.icon}`}
                        width={60}
                        height={60}
                      />
                      <h3 className="card__title">{item.name}</h3>
                    </div>

                    <div className="card__arrow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#000000"
                        viewBox="0 0 24 24"
                        height="15"
                        width="15"
                      >
                        <path
                          fill="#000000"
                          d="M13.4697 17.9697C13.1768 18.2626 13.1768 18.7374 13.4697 19.0303C13.7626 19.3232 14.2374 19.3232 14.5303 19.0303L20.3232 13.2374C21.0066 12.554 21.0066 11.446 20.3232 10.7626L14.5303 4.96967C14.2374 4.67678 13.7626 4.67678 13.4697 4.96967C13.1768 5.26256 13.1768 5.73744 13.4697 6.03033L18.6893 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H18.6893L13.4697 17.9697Z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style jsx global>{`
        /* Custom dot styles */
        .spdcoll1 .slick-dots {
          position: static;
          margin-top: 10px !important;
          display: flex !important;
          justify-content: center;
          padding-top: 15px;
        }

        .spdcoll1 .slick-dots li {
          margin: 0 5px;
        }

        .custom-dot {
          width: 10px;
          height: 10px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          display: inline-block;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .spdcoll1 .slick-dots li.slick-active .custom-dot {
          background-color: #5ca595;
          width: 12px;
          height: 12px;
        }

        /* Navigation arrows */
        .nav-sw {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          z-index: 10;
        }

        .nav-prev-slider {
          left: -30px;
        }

        .nav-next-slider {
          right: -30px;
        }
      `}</style>
    </section>
  );
}
