import React from "react";
import Shopcard28 from "../shopCards/ProductCard28";

export default function ProductGrid({ gridItems = 4, allproducts }) {
  return (
    <>
      <div className="grid-layout wrapper-shop" data-grid={`grid-${gridItems}`}>
        {allproducts?.map((elm, i) => (
          <Shopcard28 product={elm} key={i} />
        ))}
      </div>
    </>
  );
}
