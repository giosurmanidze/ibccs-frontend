import Brands from "@/components/common/Brands";
import Features from "@/components/common/Features2";
import Collections from "@/components/homes/home-gaming-accessories/Collections";
import Hero from "@/components/homes/home-gaming-accessories/Hero";
import Lookbook from "@/components/homes/home-gaming-accessories/Lookbook";
import Marquee from "@/components/homes/home-gaming-accessories/Marquee";
import Products from "@/components/homes/home-gaming-accessories/Products";
import Products2 from "@/components/homes/home-gaming-accessories/Products2";
import Products3 from "@/components/homes/home-gaming-accessories/Products3";
import Store from "@/components/homes/home-gaming-accessories/Store";
import Testimonials from "@/components/homes/home-gaming-accessories/Testimonials";
import React from "react";

export default function page() {
  return (
    <>
      <div className="home-gaming-accessories color-primary-14">
        <Hero />
        <Features bgColor="flat-spacing-3 flat-iconbox line" />
        <Collections />
        <Products2 />
        <Lookbook />
        <Products3 />
        <Store />
      </div>
    </>
  );
}
