"use client";
import Link from "next/link";
import React from "react";

export default function Shopcard28({ product }) {
  return (
    <div className="h-full min-w-[300px] max-w-[400px] w-full min-h-[430px]">
      <Link
        href={`product-detail?categoryId=${product.category_id}&serviceId=${product.id}`}
        className="rounded-3xl block h-full w-full"
      >
        <div
          className="flex flex-col h-full rounded-2xl border-2 border-gray-300 shadow-lg shadow-blue-100/20 p-2 sm:p-3 relative overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://img.freepik.com/free-photo/photorealistic-lawyer-environment_23-2151151939.jpg?t=st=1741704058~exp=1741707658~hmac=5b56929274bf298ba099ac9d0d5b3e9cfb159656e89eb9798af256002c6ccaa7&w=1060')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-60"></div>

          <div className="flex flex-col h-full relative z-10">
            <div className="p-3 sm:p-4">
              <p className="font-medium text-white !text-xl sm:text-xl">{product.name}</p>
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