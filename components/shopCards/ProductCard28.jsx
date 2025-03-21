"use client";
import Link from "next/link";
import React, { useState } from "react";

export default function Shopcard28({ product }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="h-full min-w-[300px] max-w-[400px] w-full min-h-[430px]">
      <Link
        href={`product-detail?categoryId=${product.category?.id}&serviceId=${product.id}`}
        className="rounded-3xl block h-full w-full"
      >
        <div
          className="flex flex-col h-full rounded-2xl border-2 border-gray-300 shadow-lg shadow-blue-100/20 p-2 sm:p-3 relative overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url(${product.illustration})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-60"></div>

          <div className="flex flex-col h-full relative z-10">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white !text-xl sm:text-xl">
                  {product.name}
                </p>
                <div
                  className="relative"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTooltip(!showTooltip);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 cursor-pointer"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>

                  {showTooltip && (
                    <div className="absolute right-0 w-64 p-3 mt-2 text-sm bg-white rounded-lg shadow-lg text-gray-700 z-50">
                      {product.description ||
                        "No description available for this product."}
                    </div>
                  )}
                </div>
              </div>
              <h5 className="text-md sm:text-2xl font-bold mt-1 text-white ">
                {product.base_price} Euro
              </h5>
              {product.delivery_time && (
                <div className="mt-4 inline-flex items-center text-blue-600 bg-white px-3 py-1 rounded-full text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-1"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="ml-2!">{product.delivery_time}</span>
                </div>
              )}
            </div>
            <div className="flex-grow flex flex-col justify-end px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="mt-4 sm:mt-5 pt-2 sm:pt-3">
                <button
                  className="w-full py-3 sm:py-4 px-4 sm:px-5 text-white font-medium rounded transition-colors text-center text-base sm:text-lg hover:bg-opacity-90"
                  style={{
                    backgroundColor: "#5ca595",
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
