"use client";
import Image from "next/image";
import { Item } from "react-photoswipe-gallery";

export default function Slider1ZoomOuter({
  firstImage,
  width = 700,
  height = 975,
}) {

  return (
    <Item
      original={firstImage}
      thumbnail={firstImage}
      width={width}
      height={height}
    >
      {({ ref, open }) => (
        <a
          className="item"
          data-pswp-width={width}
          data-pswp-height={height}
          onClick={open}
        >
          <Image
            className="tf-image-zoom lazyload"
            data-zoom={firstImage}
            data-src={firstImage}
            ref={ref}
            alt="image"
            width={width}
            height={height}
            src={firstImage}
          />
        </a>
      )}
    </Item>
  );
}
