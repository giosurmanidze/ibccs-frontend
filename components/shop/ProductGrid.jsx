import React from "react";
import Shopcard28 from "../shopCards/ProductCard28";

export default function ProductGrid({ gridItems = 4, allproducts }) {
  return (
    <>
      <div
        style={{
          width: "fit-content",
          margin: "0  auto",
          fontSize: "17px",
          marginBottom: "24px",
        }}
      >
        {allproducts?.length} product(s) found
      </div>

      <div className="grid-layout wrapper-shop" data-grid={`grid-${gridItems}`}>
        {/* card product 1 */}
        {allproducts?.map((elm, i) => (
          <Shopcard28 product={elm} key={i} />
        ))}
      </div>
    </>
  );
}
