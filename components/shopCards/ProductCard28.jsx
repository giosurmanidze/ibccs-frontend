"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Shopcard28({ product }) {
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  return (
    <div className="card-product style-8">
      <Link
        href={`product-detail/${product.id}?categoryId=${product.category_id}`}
        class="bg-white rounded-3xl"
      >
        <div class="plan">
          <div class="inner" >
            <span class="pricing">
              <span>${product.base_price}</span>
            </span>
            <p class="title">{product.name}</p>
            <div className="plan-inner-div"> 
              <ul class="features">
                {typeof product.description === "string"
                  ? product.description.split(",").map((desc, index) => (
                      <li>
                        <span class="icon">
                          <svg
                            height="24"
                            width="24"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M0 0h24v24H0z" fill="none"></path>
                            <path
                              fill="currentColor"
                              d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                            ></path>
                          </svg>
                        </span>
                        <span>
                          <strong>{desc}</strong>
                        </span>
                      </li>
                    ))
                  : null}
              </ul>
              <div class="action">
                <a
                  class="button"
                  href="#"
                  onClick={() => addProductToCart(product.id)}
                >
                  {isAddedToCartProducts(product.id)
                    ? "Already Added"
                    : "Add to cart"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
