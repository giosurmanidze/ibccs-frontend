import About from "@/components/othersPages/about/About";
import Features from "@/components/othersPages/about/Features";
import FlatTitle from "@/components/othersPages/about/FlatTitle";
import ShopGram from "@/components/othersPages/about/ShopGram";
import React from "react";

export default function page() {
  return (
    <>
      <FlatTitle />
      <div className="container">
        <div className="line"></div>
      </div>
      <About />
      <Features />
      <div className="container">
        <div className="line"></div>
      </div>
      <ShopGram />
    </>
  );
}
