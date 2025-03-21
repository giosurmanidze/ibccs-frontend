"use client";
import { useGetCategories } from "@/hooks/useGetCategories";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Categories() {
  const { data: categories } = useGetCategories();

  const distributeCategories = (categories) => {
    if (!categories || categories.length === 0) return [[], []];
    
    const totalCount = categories.length;
    
    if (totalCount <= 4) return [categories, []];
    
    const firstRowCategories = categories.slice(0, 4);
    const secondRowCategories = categories.slice(4, 7);
    
    return [firstRowCategories, secondRowCategories];
  };

  const [firstRowCategories, secondRowCategories] = distributeCategories(categories);
  const hasSecondRow = secondRowCategories && secondRowCategories.length > 0;

  return (
    <section className="!py-8 !px-4 bg-gray-50 relative">
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-teal-100/30 to-transparent translate-y-1/2 -translate-x-1/2 rounded-full opacity-30"></div>
      
      <div className="container !mx-auto relative z-10">
        <div className="text-center !mb-10">
          <h2 className="!text-4xl font-semibold text-gray-800 mb-3">
            Our Categories
          </h2>
          <div className="flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5ca595]"></span>
            <span className="h-0.5 w-14 bg-[#5ca595] mx-2"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#5ca595]"></span>
          </div>
        </div>

        <div className="flex justify-center !mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 !gap-6 max-w-5xl">
            {firstRowCategories?.map((item) => (
              <Link
                key={item.id}
                href={`/shop-default?categoryId=${item.id}`}
                className="group transform transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div className="relative !h-40 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
                  <div className="absolute inset-0 z-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300"></div>
                  
                  <div className="absolute inset-0">
                    <Image
                      src={`${item.image}`}
                      alt={`${item.name} background`}
                      fill
                      className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-1"></div>
                  </div>
                  
                  <div className="relative z-10 p-4 text-center flex-grow flex flex-col justify-center items-center">
                    <div className="flex flex-col items-center">
                      <h3 className="!text-xl font-semibold text-white group-hover:text-[#5ca595] transition-colors duration-200 relative z-20 text-shadow">
                        {item.name}
                      </h3>
                    </div>
                    <div className="!mt-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-2 transition-all duration-300 relative z-20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 mx-auto drop-shadow"
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

        {hasSecondRow && (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 !gap-6 max-w-4xl">
              {secondRowCategories?.map((item) => (
                <Link
                  key={item.id}
                  href={`/shop-default?categoryId=${item.id}`}
                  className="group transform transition-transform duration-300 hover:-translate-y-1.5"
                >
                  <div className="relative !h-40 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div className="absolute inset-0 z-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300"></div>
                    
                    <div className="absolute inset-0">
                      <Image
                        src={`${item.image}`}
                        alt={`${item.name} background`}
                        fill
                        className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-1"></div>
                    </div>
                    
                    <div className="relative z-10 p-4 text-center flex-grow flex flex-col justify-center items-center">
                      <div className="flex flex-col items-center">
                        <h3 className="!text-xl font-semibold text-white group-hover:text-[#5ca595] transition-colors duration-200 relative z-20 text-shadow">
                          {item.name}
                        </h3>
                      </div>
                      <div className="!mt-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-2 transition-all duration-300 relative z-20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="white"
                          viewBox="0 0 24 24"
                          className="w-5 h-5 mx-auto drop-shadow"
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
        )}
      </div>
    </section>
  );
}