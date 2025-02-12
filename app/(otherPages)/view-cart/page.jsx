"use client";
import Testimonials from "@/components/common/Testimonials";
import Cart from "@/components/othersPages/Cart";
import React from "react";
export default function page() {
  return (
    <>
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Shopping Cart</div>
        </div>
      </div>
      <Cart />
      <Testimonials />
    </>
  );
}
