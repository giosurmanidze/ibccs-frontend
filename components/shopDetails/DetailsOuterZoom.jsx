"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { paymentImages } from "@/data/singleProductOptions";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import Slider1ZoomOuter from "./sliders/Slider1ZoomOuter";
import { useContextElement } from "@/context/Context";
import { openCartModal } from "@/utlis/openCartModal";
import axiosInstance from "@/config/axios";

export default function DetailsOuterZoom({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/product-detail");
      setPageContent(JSON.parse(response.data?.dynamic_content));
    };
    getPageContent();
  }, []);

  const button1 = pageContent?.buttons?.[0] ?? null;
  const button2 = pageContent?.buttons?.[1] ?? null;
  const button3 = pageContent?.buttons?.[2] ?? null;

  return (
    <section style={{ maxWidth: "100vw", overflow: "clip" }}>
      <div
        className="tf-main-product section-image-zoom"
        style={{ maxWidth: "100vw", overflow: "clip" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <div className="thumbs-slider">
                  <Slider1ZoomOuter firstImage={product?.icon} />
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
                    <div
                      className="badges-on-sale"
                      style={{
                        color: button3?.text_color,
                        backgroundColor: button3?.background_color,
                      }}
                    >
                      <span>20</span>% OFF
                    </div>
                  </div>
                  <div className="tf-product-info-quantity">
                    <div className="quantity-title fw-6">Quantity</div>
                    <Quantity setQuantity={setQuantity} button2={button2} />
                  </div>
                  <div className="product-description-container my-5">
                    <h5 className="text-lg font-semibold mb-2 text-gray-800">
                      Service Details
                    </h5>
                    <div className="description-content">
                      {product?.description && (
                        <p className="text-gray-700 leading-relaxed">
                          <span className="float-left text-3xl font-serif mr-2 mt-1 text-gray-900">
                            {product.description.charAt(0)}
                          </span>
                          {product.description.substring(1)}
                        </p>
                      )}
                    </div>
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
                        style={{
                          color: button1?.text_color,
                          backgroundColor: button1?.background_color,
                        }}
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
                    </form>
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
