"use client";
import { useGetCategories } from "@/hooks/useGetCategories";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Categories() {
  const { data: categories } = useGetCategories();

  return (
    <section className="!py-8 !px-4">
      <div className="container !mx-auto">
        <div className="text-center !mb-8">
          <h2 className="!text-2xl font-semibold text-gray-800 mb-4">
            Our Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 !gap-6">
          {categories?.map((item) => (
            <Link
              key={item.id}
              href={`/shop-default?categoryId=${item.id}`}
              className="group"
            >
              <div className="relative !h-40 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="absolute inset-0 z-0">
                  <Image
                    src={`${item.image}`}
                    alt={`${item.name} background`}
                    fill
                    className="object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                  />
                </div>
                <div className="relative z-10 p-4 text-center flex-grow flex flex-col justify-center items-center">
                  <div className="flex flex-col items-center">
                    <h3 className="!text-lg font-medium  text-gray-900 group-hover:text-[#5ca595] transition-colors transition-transform duration-200 relative z-20">
                      {item.name}
                    </h3>
                  </div>
                  <div className="!mt-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#5ca595"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 mx-auto"
                    >
                      <path d="M13.4697 17.9697C13.1768 18.2626 13.1768 18.7374 13.4697 19.0303C13.7626 19.3232 14.2374 19.3232 14.5303 19.0303L20.3232 13.2374C21.0066 12.554 21.0066 11.446 20.3232 10.7626L14.5303 4.96967C14.2374 4.67678 13.7626 4.67678 13.4697 4.96967C13.1768 5.26256 13.1768 5.73744 13.4697 6.03033L18.6893 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H18.6893L13.4697 17.9697Z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
