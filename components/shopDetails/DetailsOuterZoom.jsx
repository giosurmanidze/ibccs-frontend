"use client";
import React, { useState } from "react";

import Image from "next/image";
import { paymentImages } from "@/data/singleProductOptions";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import Slider1ZoomOuter from "./sliders/Slider1ZoomOuter";
import { useContextElement } from "@/context/Context";
import { openCartModal } from "@/utlis/openCartModal";

export default function DetailsOuterZoom({ product }) {
  const [quantity, setQuantity] = useState(1);

  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  return (
    <section
      className="flat-spacing-4 pt_0"
      style={{ maxWidth: "100vw", overflow: "clip" }}
    >
      <div
        className="tf-main-product section-image-zoom"
        style={{ maxWidth: "100vw", overflow: "clip" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <div className="thumbs-slider">
                  <Slider1ZoomOuter
                    firstImage={product?.icon}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-title">
                    <h6>{product?.name}</h6>
                  </div>
                  <div className="tf-product-info-price">
                    <div className="price-on-sale">${product?.base_price}</div>
                    <div className="badges-on-sale">
                      <span>20</span>% OFF
                    </div>
                  </div>
                  <div className="tf-product-info-quantity">
                    <div className="quantity-title fw-6">Quantity</div>
                    <Quantity setQuantity={setQuantity} />
                  </div>
                  <div className="tf-product-info-buy-button">
                    <form onSubmit={(e) => e.preventDefault()} className="">
                      <a
                        onClick={() => {
                          openCartModal();
                          addProductToCart(
                            product?.id,
                            quantity ? quantity : 1
                          );
                        }}
                        className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
                      >
                        <span>
                          {isAddedToCartProducts(product?.id)
                            ? "Already Added"
                            : "Add to cart"}
                        </span>
                        <span
                          className="tf-qty-price"
                          style={{ marginLeft: "10px" }}
                        >
                          ${(product?.base_price * quantity).toFixed(2)}
                        </span>
                      </a>
                      <div className="w-100">
                        <a href="#" className="btns-full">
                          Buy with
                          <Image
                            alt="image"
                            src="/images/payments/paypal.png"
                            width={64}
                            height={18}
                          />
                        </a>
                      </div>
                    </form>
                  </div>

                  <div className="tf-product-info-delivery-return">
                    <div className="row">
                      <div className="col-xl-6 col-12">
                        <div className="tf-product-delivery">
                          <div className="icon">
                            <i className="icon-delivery-time" />
                          </div>
                          <p>
                            Estimate delivery times:
                            <span className="fw-7">12-26 days</span>
                            (International),
                            <span className="fw-7">3-6 days</span> (United
                            States).
                          </p>
                        </div>
                      </div>
                      <div className="col-xl-6 col-12">
                        <div className="tf-product-delivery mb-0">
                          <div className="icon">
                            <i className="icon-return-order" />
                          </div>
                          <p>
                            Return within <span className="fw-7">30 days</span>{" "}
                            of purchase. Duties &amp; taxes are non-refundable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tf-product-info-trust-seal">
                    <div className="tf-product-trust-mess">
                      <i className="icon-safe" />
                      <p className="fw-6">
                        Guarantee Safe <br />
                        Checkout
                      </p>
                    </div>
                    <div className="tf-payment">
                      {paymentImages.map((image, index) => (
                        <Image
                          key={index}
                          alt={image.alt}
                          src={image.src}
                          width={image.width}
                          height={image.height}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      <StickyItem />
    </section>
  );
}
