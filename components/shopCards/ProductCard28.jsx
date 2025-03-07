"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import React from "react";

export default function Shopcard28({ product }) {
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  return (
    <div className="h-full min-w-[300px] max-w-[400px] w-full min-h-[550px]">
      <Link
        href={`product-detail/${product.id}?categoryId=${product.category_id}`}
        className="rounded-3xl block h-full"
      >
        <div className="flex flex-col h-full rounded-2xl border-2 border-gray-300 shadow-lg shadow-blue-100/20 p-2 sm:p-3 text-gray-600">
          <div className="flex flex-col h-full">
            <div className="p-3 sm:p-4">
              <p className="font-medium text-lg sm:text-xl">{product.name}</p>
              <h4 className="text-xl sm:text-2xl font-bold mt-1">
                ${product.base_price}
              </h4>
            </div>
            <div className="h-[1px] w-full bg-[#D8DADB]"></div>
            <div className="px-3 sm:px-4 pt-3 sm:pt-4">
              <h5 className="text-blue-600 font-semibold text-base sm:text-lg">
                We offer:
              </h5>
            </div>
            <div className="flex-grow flex flex-col  justify-between px-3 sm:px-4 pb-3 sm:pb-4">
              <ul className="overflow-auto flex-grow space-y-3 sm:space-y-4 mt-2 sm:mt-3 max-h-[180px] sm:max-h-none scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1 ">
                {typeof product.description === "string"
                  ? product.description.split(",").map((desc, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 sm:gap-3 mt-2"
                      >
                        <span className="flex-shrink-0 text-green-500 mt-0.5">
                          <svg
                            height="18"
                            width="18"
                            className="sm:h-6 sm:w-6"
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
                        <span className="font-medium text-md sm:text-lg leading-tight line-clamp-2">
                          {desc.trim()}
                        </span>
                      </li>
                    ))
                  : null}
              </ul>
              <div className="mt-4 sm:mt-5 pt-2 sm:pt-3">
                <button
                  className="w-full py-3 sm:py-4 px-4 sm:px-5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors text-center text-base sm:text-lg hover_effect"
                  onClick={(e) => {
                    e.preventDefault();
                    addProductToCart(product.id);
                  }}
                >
                  {isAddedToCartProducts(product.id)
                    ? "Already Added"
                    : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
