import React from "react";
import Image from "next/image";
export default function Hero() {
  return (
    <section className="tf-slideshow about-us-page position-relative">
      <div className="banner-wrapper">
        <Image
          className="lazyload"
          src="/images/slider/established.jpg"
          data-=""
          alt="image-collection"
          width={2000}
          height={1262}
        />
        <div className="box-content text-center">
          <div className="container">
            <div className="text text-white">
              FINDING SOLUTIONS IS OUR SPECIALITY{" "}
              <br className="d-xl-block d-none" />
              fitness goals with style
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
