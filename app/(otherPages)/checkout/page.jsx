import Checkout from "@/components/othersPages/Checkout";
import React from "react";

export default function page() {
  return (
    <>
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Check Out</div>
        </div>
      </div>

      <Checkout />
    </>
  );
}
