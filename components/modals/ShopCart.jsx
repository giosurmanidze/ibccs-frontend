"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ShopCart({ pageContent }) {
  const {
    cartProducts,
    isLoadingCart,
    updateQuantity,
    removeItemFromCart,
    fetchCartData,
  } = useContextElement();

  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price whenever cart changes
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, elm) => {
      const serviceTotal =
        elm.base_price * elm.quantity +
        (elm.extraTaxFields
          ? Object.values(elm.extraTaxFields).reduce(
              (sum, field) => sum + (Number(field.extra_tax) || 0),
              0
            )
          : 0);

      return accumulator + serviceTotal;
    }, 0);

    setTotalPrice(subtotal);
  }, [cartProducts]);

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCartData();
  }, []);

  // Handle quantity update with API
  const handleQuantityChange = (id, quantity) => {
    if (quantity >= 1) {
      updateQuantity(id, quantity);
    }
  };

  // Handle remove item with API
  const handleRemoveItem = (id) => {
    removeItemFromCart(id);
  };

  return (
    <div className="modal fullRight fade modal-shopping-cart" id="shoppingCart">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="header">
            <div className="title fw-5">Shopping cart</div>
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
                        // Get service data either from nested service object or direct properties
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
                          <div key={i} className="tf-mini-cart-item">
                            <div className="tf-mini-cart-image">
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
                                ${" "}
                                {(
                                  basePrice * elm.quantity +
                                  (elm.extraTaxFields
                                    ? Object.values(elm.extraTaxFields).reduce(
                                        (sum, field) =>
                                          sum + (Number(field.extra_tax) || 0),
                                        0
                                      )
                                    : 0)
                                ).toFixed(2)}
                              </div>
                              <div className="tf-mini-cart-btns">
                                <div className="wg-quantity small">
                                  <span
                                    className="btn-quantity minus-btn"
                                    onClick={() =>
                                      handleQuantityChange(
                                        elm.id,
                                        elm.quantity - 1
                                      )
                                    }
                                  >
                                    -
                                  </span>
                                  <input
                                    type="text"
                                    name="number"
                                    value={elm.quantity}
                                    min={1}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        elm.id,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                  />
                                  <span
                                    className="btn-quantity plus-btn"
                                    onClick={() =>
                                      handleQuantityChange(
                                        elm.id,
                                        elm.quantity + 1
                                      )
                                    }
                                  >
                                    +
                                  </span>
                                </div>
                                <div
                                  className="tf-mini-cart-remove"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleRemoveItem(elm.id)}
                                >
                                  Remove
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="container">
                        <div className="row align-items-center mt-5 mb-5">
                          <div className="col-12 fs-18">
                            Your shop cart is empty
                          </div>
                          <div className="col-12 mt-3">
                            {Array.isArray(pageContent) && pageContent[1] && (
                              <Link
                                href={pageContent[1].url}
                                className="tf-btn w-full mb-2"
                                style={{
                                  backgroundColor:
                                    pageContent[1].background_color,
                                  color: pageContent[1].text_color,
                                }}
                              >
                                {pageContent[1].text}
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
                    <div className="tf-cart-total">Subtotal</div>
                    <div className="tf-totals-total-value fw-6">
                      €{totalPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="tf-mini-cart-line" />
                  <div className="tf-mini-cart-view-checkout">
                    {Array.isArray(pageContent) && pageContent[0] && (
                      <Link
                        href={pageContent[0].url}
                        className="tf-btn w-full mb-2"
                        style={{
                          backgroundColor: "#000000",
                          color: "#ffffff",
                        }}
                      >
                        {pageContent[0].text}
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
