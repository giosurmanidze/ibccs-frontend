import Collections from "@/components/homes/home-gaming-accessories/Collections";
import Hero from "@/components/homes/home-gaming-accessories/Hero";
import Lookbook from "@/components/homes/home-gaming-accessories/Lookbook";
import Products2 from "@/components/homes/home-gaming-accessories/Products2";
import Store from "@/components/homes/home-gaming-accessories/Store";
import React from "react";

export default function page() {
  return (
    <>
      <div className="home-gaming-accessories color-primary-14">
        <Hero />
        <Collections />
        <Products2 />
        <Lookbook />
        <Store />
      </div>
    </>
  );
}
