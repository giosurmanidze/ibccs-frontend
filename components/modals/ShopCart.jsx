"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function ShopCart({ pageContent }) {
  const { cartProducts, setCartProducts } = useContextElement();

  const setQuantity = (id, quantity) => {
    if (quantity >= 1) {
      const item = cartProducts.filter((elm) => elm.id == id)[0];
      const items = [...cartProducts];
      const itemIndex = items.indexOf(item);
      item.quantity = quantity;
      items[itemIndex] = item;
      setCartProducts(items);
    }
  };

  const removeItem = (id) => {
    setCartProducts((pre) => pre.filter((elm) => elm.id !== id));

    let existingOrderDetails =
      JSON.parse(sessionStorage.getItem("order_details")) || [];
    existingOrderDetails = existingOrderDetails.filter(
      (order) => order.service_id !== id
    );

    sessionStorage.setItem(
      "order_details",
      JSON.stringify(existingOrderDetails)
    );
  };

  const [totalPrice2, setTotalPrice2] = useState(0);
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

    setTotalPrice2(subtotal);
  }, [cartProducts]);

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
                    {cartProducts.map((elm, i) => (
                      <div key={i} className="tf-mini-cart-item">
                        <div className="tf-mini-cart-image">
                          <Link
                            href={`/product-detail/${elm.id}?categoryId=${elm.category_id}`}
                          >
                            <Image
                              alt="image"
                              src={`http://localhost:8000/storage/${elm.icon}`}
                              width={50}
                              height={70}
                            />
                          </Link>
                        </div>
                        <div className="tf-mini-cart-info">
                          <Link
                            className="title link"
                            href={`/product-detail/${elm.id}?categoryId=${elm.category_id}`}
                          >
                            {elm.name}
                          </Link>
                          <div className="price fw-6">
                            ${" "}
                            {(
                              elm.base_price * elm.quantity +
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
                                  setQuantity(elm.id, elm.quantity - 1)
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
                                  setQuantity(elm.id, e.target.value / 1)
                                }
                              />
                              <span
                                className="btn-quantity plus-btn"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity + 1)
                                }
                              >
                                +
                              </span>
                            </div>
                            <div
                              className="tf-mini-cart-remove"
                              style={{ cursor: "pointer" }}
                              onClick={() => removeItem(elm.id)}
                            >
                              Remove
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!cartProducts.length && (
                      <div className="container">
                        <div className="row align-items-center mt-5 mb-5">
                          <div className="col-12 fs-18">
                            Your shop cart is empty
                          </div>
                          <div className="col-12 mt-3">
                            {Array.isArray(pageContent) && pageContent[1] && (
                              <Link
                                href={pageContent[1].url}
                                className="tf-btn  w-full mb-2"
                                style={{
                                  backgroundColor: pageContent[1].background_color,
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
                      ${totalPrice2} USD
                    </div>
                  </div>
                  <div className="tf-mini-cart-line" />
                  <div className="tf-mini-cart-view-checkout">
                    {Array.isArray(pageContent) && pageContent[1] && (
                      <Link
                        href={pageContent[0].url}
                        className="tf-btn w-full mb-2"
                        style={{
                          backgroundColor: pageContent[0].background_color,
                          color: pageContent[0].text_color,
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
