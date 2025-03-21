"use client";
import React, { useEffect, useRef, useState } from "react";
import Nav from "./Nav";
import Image from "next/image";
import Link from "next/link";
import CartLength from "../common/CartLength";
import { useGetCategories } from "@/hooks/useGetCategories";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/config/axios";
import CategoriesDropdown from "./CategoriesDropdown";

export default function Header22({ pageContent }) {
  const { data: categories } = useGetCategories();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (query.trim() !== "") {
      setIsLoading(true);

      try {
        const response = await axiosInstance.get(
          `/services/search?name=${query}`
        );

        setData(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setData([]);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setData([]);
  };

  const header_background = pageContent?.header?.background_color["value"];
  const placeholder_text =
    pageContent?.header?.search_placeholder_text["value"];
  const placeholder_background_color =
    pageContent?.header?.search_background_color["value"];
  const search_placeholder_text_color =
    pageContent?.header?.search_placeholder_text_color["value"];
  const search_icon_background =
    pageContent?.header?.search_icon_background["value"];
  const search_icon_color = pageContent?.header?.search_icon_color["value"];
  const cart_color = pageContent?.header?.cart_color["value"];
  const quantity_circle = pageContent?.header?.quantity_circle["value"];
  const quantity_circle_text =
    pageContent?.header?.quantity_circle_text["value"];
  const categories_dropdown_background =
    pageContent?.header?.categories_dropdown_background["value"];
  const categories_dropdown_text =
    pageContent?.header?.categories_dropdown_text["value"];
  const bottom_header_background =
    pageContent?.header?.bottom_header_background["value"];
  const support_center_number =
    pageContent?.header?.support_center_number["value"];
  const support_number_color =
    pageContent?.header?.support_number_color["value"];
  const support_center_text = pageContent?.header?.support_center_text["value"];
  const support_center_text_color =
    pageContent?.header?.support_center_text_color["value"];
  const support_center_icon_color =
    pageContent?.header?.support_center_icon_color["value"];
  const bottom_header_buttons = pageContent?.bottom_header_buttons;

  return (
    <header
      id="header"
      className="header-default header-style-2 header-style-4"
    >
      <div
        className="main-header line-1"
        style={{ backgroundColor: header_background }}
      >
        <div className="container">
          <div className="row wrapper-header align-items-center">
            <div className="col-md-4 col-3 tf-lg-hidden">
              <a
                href="#mobileMenu"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
                className="text_white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={16}
                  viewBox="0 0 24 16"
                  fill="none"
                >
                  <path
                    d="M2.00056 2.28571H16.8577C17.1608 2.28571 17.4515 2.16531 17.6658 1.95098C17.8802 1.73665 18.0006 1.44596 18.0006 1.14286C18.0006 0.839753 17.8802 0.549063 17.6658 0.334735C17.4515 0.120408 17.1608 0 16.8577 0H2.00056C1.69745 0 1.40676 0.120408 1.19244 0.334735C0.978109 0.549063 0.857702 0.839753 0.857702 1.14286C0.857702 1.44596 0.978109 1.73665 1.19244 1.95098C1.40676 2.16531 1.69745 2.28571 2.00056 2.28571ZM0.857702 8C0.857702 7.6969 0.978109 7.40621 1.19244 7.19188C1.40676 6.97755 1.69745 6.85714 2.00056 6.85714H22.572C22.8751 6.85714 23.1658 6.97755 23.3801 7.19188C23.5944 7.40621 23.7148 7.6969 23.7148 8C23.7148 8.30311 23.5944 8.59379 23.3801 8.80812C23.1658 9.02245 22.8751 9.14286 22.572 9.14286H2.00056C1.69745 9.14286 1.40676 9.02245 1.19244 8.80812C0.978109 8.59379 0.857702 8.30311 0.857702 8ZM0.857702 14.8571C0.857702 14.554 0.978109 14.2633 1.19244 14.049C1.40676 13.8347 1.69745 13.7143 2.00056 13.7143H12.2863C12.5894 13.7143 12.8801 13.8347 13.0944 14.049C13.3087 14.2633 13.4291 14.554 13.4291 14.8571C13.4291 15.1602 13.3087 15.4509 13.0944 15.6653C12.8801 15.8796 12.5894 16 12.2863 16H2.00056C1.69745 16 1.40676 15.8796 1.19244 15.6653C0.978109 15.4509 0.857702 15.1602 0.857702 14.8571Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
            <div className="col-md-4 col-6">
              <Link href={`/`} className="logo-header">
                <Image
                  alt="logo"
                  className="logo"
                  src={pageContent?.header?.header_logo["value"]}
                  width={280}
                  height={52}
                  style={{ width: "165px", height: "auto" }}
                  priority
                />
              </Link>
            </div>
            <div className="col-md-4 col-6 tf-md-hidden">
              <div className="tf-form-search">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="search-box"
                >
                  <input
                    type="text"
                    placeholder={placeholder_text}
                    style={{
                      backgroundColor: placeholder_background_color,
                      "&::placeholder": {
                        color: search_placeholder_text_color,
                      },
                    }}
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <button
                    className="tf-btn"
                    type="button"
                    style={{
                      backgroundColor: search_icon_background,
                    }}
                  >
                    <i
                      className="icon icon-search"
                      style={{ color: search_icon_color }}
                    />
                  </button>
                </form>

                {searchTerm && data.length > 0 && (
                  <div className="search-suggests-results">
                    <div className="search-suggests-results-inner">
                      <ul>
                        {data.map((product, index) => (
                          <li key={index} className="search-card">
                            <Link
                              href={`/product-detail/${product.id}?categoryId=${product.category_id}`}
                              className="search-card-link"
                            >
                              <div className="search-card-img-box">
                                <Image
                                  alt={product.name}
                                  src={`http://api.ibccsonline.ge/${product.icon}`}
                                  width={50}
                                  height={50}
                                  className="search-card-img"
                                />
                              </div>
                              <div className="search-card-content">
                                <p className="search-card-title">
                                  {product.name}
                                </p>
                                <p className="search-card-price">
                                  ${product.base_price}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {searchTerm && (
                  <div className="search-results-meta bg-gray-50 rounded-md p-3 shadow-sm border border-gray-200 flex items-center justify-between mb-4 mt-2">
                    <p className="text-gray-700 text-sm font-medium">
                      Found
                      <span className="font-bold text-blue-600">
                        {data.length}
                      </span>
                      results
                      {searchTerm && (
                        <span>
                          for
                          <span className="italic text-gray-800">
                            {searchTerm}
                          </span>
                        </span>
                      )}
                    </p>
                    <button
                      className="ml-2 px-3 py-1 text-xs bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center"
                      onClick={clearSearch}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Clear Search
                    </button>
                  </div>
                )}
                {isLoading && searchTerm && (
                  <div className="search-suggests-results">
                    <p>Loading...</p>
                  </div>
                )}

                {searchTerm && data.length === 0 && !isLoading && (
                  <div className="search-suggests-results">
                    <p>No results found.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-4 col-3">
              <ul className="nav-icon d-flex justify-content-end align-items-center gap-20">
                <li className="nav-search">
                  <a
                    href="#canvasSearch"
                    data-bs-toggle="offcanvas"
                    aria-controls="offcanvasLeft"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-search" style={{ color: "red" }} />
                  </a>
                </li>
                {user === null ? (
                  <li className="nav-account flex gap-2">
                    {pageContent?.buttons?.map((button, index) => (
                      <a
                        key={index}
                        href={`${button.url}`}
                        className="nav-icon-item items-center justify-center"
                        style={{
                          color: button.text_color,
                        }}
                      >
                        <span className="text" style={{ color: "inherit" }}>
                          {button.text}
                        </span>
                      </a>
                    ))}
                  </li>
                ) : (
                  <li className="nav-account relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-3 py-1.5 px-3 rounded-full  transition-all duration-300 shadow-md group"
                      type="button"
                    >
                      <div className="flex items-center justify-center  text-white p-1.5 rounded-full h-8 w-8 shadow-inner overflow-hidden  transition-colors">
                        <i className="icon icon-account" />
                      </div>
                      <span className="text text-white font-medium pr-1">
                        {user?.name}
                      </span>
                      <div className="ml-1 h-5 w-5  flex items-center justify-center  transition-colors">
                        <svg
                          className="w-3 h-3  group-hover:translate-y-0.5 transition-transform"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 10 6"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                          />
                        </svg>
                      </div>
                    </button>
                    {isDropdownOpen && (
                      <div className="z-10 absolute !mt-12 bg-white divide-y divide-gray-100 rounded-lg shadow-md w-44 dark:bg-gray-700 dark:divide-gray-600">
                        <div className="!px-4 !py-3 text-sm text-gray-900 dark:text-white">
                          <div className="font-semibold">
                            {user?.name} {user?.lastname}
                          </div>
                          <div className="font-medium truncate">
                            {user?.email}
                          </div>
                        </div>
                        <ul className="py-2 text-sm">
                          <li className="w-full">
                            <Link
                              onClick={() => setIsDropdownOpen(false)}
                              href="/my-profile"
                              class="block !flex gap-1 !px-4 !py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              <svg
                                className="w-4 h-4 mr-3"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              My profile
                            </Link>
                          </li>
                          <li className="w-full">
                            <Link
                              onClick={() => setIsDropdownOpen(false)}
                              href="/my-orders"
                              class="block !flex gap-1 !px-4 w-full !py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              <svg
                                className="w-4 h-4 mr-3"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="2"
                                  y="4"
                                  width="20"
                                  height="16"
                                  rx="2"
                                ></rect>
                                <path d="M7 15h0M2 9.5h20"></path>
                              </svg>
                              My Orders
                            </Link>
                          </li>
                        </ul>
                        <div className="py-2 border-t border-gray-100 dark:border-gray-600">
                          <a
                            onClick={logout}
                            className="!flex items-center !px-5 gap-1 !py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-red-400"
                          >
                            <svg
                              className="w-4 h-4 mr-3"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Sign out
                          </a>
                        </div>
                      </div>
                    )}
                  </li>
                )}
                <li className="nav-cart cart-lg line-left-1">
                  <a
                    href="#shoppingCart"
                    data-bs-toggle="modal"
                    className="nav-icon-item text-white"
                  >
                    <i
                      className="icon icon-bag"
                      style={{ color: cart_color }}
                    />
                    <span
                      className="count-box"
                      style={{
                        backgroundColor: quantity_circle,
                      }}
                    >
                      <CartLength color={quantity_circle_text} />
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div
        className="header-bottom tf-md-hidden"
        style={{ backgroundColor: bottom_header_background }}
      >
        <div className="container">
          <div className="wrapper-header d-flex justify-content-between align-items-center">
            <div className="box-left">
              <CategoriesDropdown
                categories={categories}
                backgroundColor={categories_dropdown_background}
                textColor={categories_dropdown_text}
              />
              <nav className="box-navigation text-center">
                <ul className="box-nav-ul d-flex align-items-center justify-content-center gap-30">
                  <Nav bottom_header_buttons={bottom_header_buttons} />
                </ul>
              </nav>
            </div>
            <div className="box-right">
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={28}
                  height={28}
                  viewBox="0 0 28 28"
                  fill={support_center_icon_color}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.21989 13.7008C2.19942 13.7199 2.18295 13.743 2.17143 13.7685C2.1599 13.7941 2.15354 13.8217 2.15272 13.8497V18.5857C2.15272 19.4124 2.83298 20.0926 3.65962 20.0926H5.5256C5.64874 20.0926 5.74087 20.0005 5.74087 19.8774V13.8497C5.73977 13.793 5.71674 13.7389 5.6766 13.6987C5.63647 13.6586 5.58235 13.6356 5.5256 13.6345H2.36799C2.3118 13.6361 2.25855 13.66 2.21989 13.7008ZM0 13.8497C0.00339224 13.2228 0.253966 12.6224 0.697317 12.1791C1.14067 11.7357 1.74101 11.4851 2.36799 11.4817H5.5256C6.15335 11.4827 6.75513 11.7324 7.19902 12.1763C7.64291 12.6202 7.89268 13.222 7.89359 13.8497V19.8774C7.89428 20.1885 7.83349 20.4967 7.71473 20.7844C7.59597 21.072 7.42157 21.3333 7.20154 21.5533C6.98152 21.7733 6.7202 21.9477 6.4326 22.0665C6.14499 22.1852 5.83676 22.246 5.5256 22.2453H3.65962C1.64468 22.2453 0 20.6007 0 18.5857V13.8497Z"
                    fill={support_center_icon_color}
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.9927 2.15272C12.8144 2.1517 11.6476 2.38302 10.5588 2.83344C9.47008 3.28386 8.48083 3.94455 7.64769 4.77769C6.81455 5.61083 6.15387 6.60007 5.70345 7.68882C5.25303 8.77756 5.02171 9.94444 5.02273 11.1227V12.5719C5.02273 12.8574 4.90933 13.1311 4.70747 13.333C4.50561 13.5348 4.23184 13.6482 3.94637 13.6482C3.6609 13.6482 3.38712 13.5348 3.18527 13.333C2.98341 13.1311 2.87001 12.8574 2.87001 12.5719V11.1227C2.87001 4.97451 7.84451 0 13.9927 0C20.1409 0 25.1154 4.97451 25.1154 11.1227V12.5581C25.1154 12.8436 25.002 13.1174 24.8001 13.3192C24.5982 13.5211 24.3245 13.6345 24.039 13.6345C23.7535 13.6345 23.4798 13.5211 23.2779 13.3192C23.076 13.1174 22.9626 12.8436 22.9626 12.5581V11.1227C22.9626 6.16281 18.9525 2.15272 13.9927 2.15272ZM24.107 20.1133C24.2457 20.1411 24.3775 20.1959 24.495 20.2746C24.6124 20.3534 24.7132 20.4545 24.7916 20.5722C24.87 20.6899 24.9244 20.8219 24.9517 20.9607C24.979 21.0994 24.9788 21.2422 24.9509 21.3808C24.1914 25.1601 20.859 28 16.8627 28H15.4281C15.1426 28 14.8689 27.8866 14.667 27.6847C14.4652 27.4829 14.3518 27.2091 14.3518 26.9236C14.3518 26.6382 14.4652 26.3644 14.667 26.1625C14.8689 25.9607 15.1426 25.8473 15.4281 25.8473H16.8627C18.2705 25.8473 19.635 25.3603 20.7245 24.4688C21.8141 23.5773 22.5617 22.3362 22.8404 20.9563C22.8967 20.6766 23.0617 20.4307 23.2992 20.2726C23.5367 20.1146 23.8273 20.0572 24.107 20.1133Z"
                    fill={support_center_icon_color}
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M22.3117 13.7008C22.2912 13.7199 22.2747 13.743 22.2632 13.7685C22.2517 13.7941 22.2453 13.8217 22.2445 13.8497V19.8774C22.2445 19.9936 22.3444 20.0926 22.4598 20.0926H24.2543C25.124 20.0926 25.8326 19.3831 25.8326 18.5134V13.8497C25.8315 13.793 25.8085 13.7389 25.7684 13.6987C25.7282 13.6586 25.6741 13.6356 25.6174 13.6345H22.4598C22.4036 13.6361 22.3503 13.66 22.3117 13.7008ZM20.0918 13.8497C20.0952 13.2228 20.3457 12.6224 20.7891 12.1791C21.2324 11.7357 21.8328 11.4851 22.4598 11.4817H25.6174C26.2451 11.4827 26.8469 11.7324 27.2908 12.1763C27.7347 12.6202 27.9845 13.222 27.9854 13.8497V18.5134C27.9847 19.5028 27.5914 20.4515 26.8918 21.1512C26.1923 21.8509 25.2437 22.2444 24.2543 22.2453H22.4598C21.832 22.2444 21.2302 21.9947 20.7863 21.5508C20.3425 21.1069 20.0927 20.5051 20.0918 19.8774V13.8497Z"
                    fill={support_center_icon_color}
                  />
                </svg>
              </div>
              <div className="number d-grid">
                <a
                  href={`https://wa.me/${support_center_number?.replace(
                    /[^0-9]/g
                  )}`}
                  className="phone"
                  style={{ color: support_number_color }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {support_center_number}
                </a>
                <span
                  className="fw-5 text"
                  style={{ color: support_center_text_color }}
                >
                  {support_center_text}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
