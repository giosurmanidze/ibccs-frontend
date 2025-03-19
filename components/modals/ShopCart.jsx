"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ShopCart({ buttons, content }) {
  const { cartProducts, isLoadingCart, fetchCartData, subtotal } =
    useContextElement();

  useEffect(() => {
    fetchCartData();
  }, []);

  const headerText = content?.header_text.value;
  const portfolio_condition = content?.portfolio_condition.value;
  const total_price_text = content?.total_price_text.value;

  return (
    <div className="modal fullRight fade modal-shopping-cart" id="shoppingCart">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="header">
            <div className="title fw-5">{headerText}</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="wrap">
            <div className="tf-mini-cart-wrap">
              <div className="tf-mini-cart-main">
                <div className="tf-mini-cart-sroll">
                  <div className="tf-mini-cart-items">
                    {isLoadingCart ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                        <span className="ml-2 text-gray-600">
                          Loading cart...
                        </span>
                      </div>
                    ) : cartProducts.length > 0 ? (
                      cartProducts.map((elm, i) => {
                        const serviceData = elm.service || elm;
                        const serviceId = elm.service_id || elm.id;
                        const categoryId = serviceData.category_id || null;
                        const serviceName =
                          serviceData.name || "Unknown Service";
                        const serviceIcon =
                          serviceData.icon || "/placeholder-image.jpg";
                        const basePrice = parseFloat(
                          serviceData.base_price || 0
                        );

                        return (
                          <div
                            key={i}
                            className="tf-mini-cart-item flex items-center"
                          >
                            <div>
                              <Link
                                href={`/product-detail?serviceId=${serviceId}&categoryId=${categoryId}`}
                              >
                                <Image
                                  alt="image"
                                  src={serviceIcon}
                                  width={50}
                                  height={70}
                                />
                              </Link>
                            </div>
                            <div className="tf-mini-cart-info">
                              <Link
                                className="title link"
                                href={`/product-detail?serviceId=${serviceId}&categoryId=${categoryId}`}
                              >
                                {serviceName}
                              </Link>
                              <div className="price fw-6">
                                ${elm.total_price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="container">
                        <div className="row align-items-center mt-5 mb-5">
                          <div className="col-12 fs-18">
                            {portfolio_condition}
                          </div>
                          <div className="col-12 mt-3">
                            {Array.isArray(buttons) && buttons[1] && (
                              <Link
                                href={buttons[1].url}
                                className="tf-btn w-full mb-2"
                                style={{
                                  backgroundColor: buttons[1].background_color,
                                  color: buttons[1].text_color,
                                }}
                              >
                                {buttons[1].text}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="tf-mini-cart-bottom">
                <div className="tf-mini-cart-bottom-wrap">
                  <div className="tf-cart-totals-discounts">
                    <div className="tf-cart-total">{total_price_text}</div>
                    <div className="tf-totals-total-value fw-6">
                      €{subtotal.toFixed(2)}
                    </div>
                  </div>
                  <div className="tf-mini-cart-line" />
                  <div className="tf-mini-cart-view-checkout">
                    {Array.isArray(buttons) && buttons[0] && (
                      <Link
                        href={buttons[0].url}
                        className="tf-btn w-full mb-2"
                        style={{
                          backgroundColor: buttons[0].background_color,
                          color: buttons[0].text_color,
                        }}
                      >
                        {buttons[0].text}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
