"use client";
import { layouts } from "@/data/shop";
import ProductGrid from "./ProductGrid";
import { useState } from "react";
import ShopFilter from "./ShopFilter";
import Sorting from "./Sorting";
import { useGetCategory } from "@/hooks/useCategory";
import { useSearchParams } from "next/navigation";
import { useGetCategories } from "@/hooks/useGetCategories";

export default function ShopDefault() {
  const [gridItems, setGridItems] = useState(4);
  const [products, setProducts] = useState([]);
  const [finalSorted, setFinalSorted] = useState([]);

  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  const { data: category } = useGetCategory(categoryId, {
    enabled: !!categoryId,
  });

  const { data: categories } = useGetCategories({
    enabled: !categoryId,
  });

  const servicesLength = categoryId
    ? category?.services?.length
    : categories?.reduce((acc, cat) => acc + (cat.services?.length || 0), 0);

  const services = categoryId
    ? category?.services
    : categories?.flatMap((cat) => cat.services) || [];

  return (
    <>
      <section className="flat-spacing-2">
        <div className="container">
          <div className="tf-shop-control grid-3 align-items-center">
            <div className="tf-control-filter">
              <a
                href="#filterShop"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
                className="tf-btn-filter"
              >
                <span className="icon icon-filter" />
                <span className="text">Filter</span>
              </a>
            </div>
            <ul className="tf-control-layout d-flex justify-content-center">
              {layouts.map((layout, index) => (
                <li
                  key={index}
                  className={`tf-view-layout-switch ${layout.className} ${
                    gridItems == layout.dataValueGrid ? "active" : ""
                  }`}
                  onClick={() => setGridItems(layout.dataValueGrid)}
                >
                  <div className="item">
                    <span className={`icon ${layout.iconClass}`} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="tf-control-sorting d-flex justify-content-end">
              <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                <Sorting setFinalSorted={setFinalSorted} category={services} />
              </div>
            </div>
          </div>
          <div className="wrapper-control-shop">
            <div className="meta-filter-shop" />
            <ProductGrid gridItems={gridItems} allproducts={services} />
            {/* {servicesLength > 0 && (
              <ul className="tf-pagination-wrap tf-pagination-list tf-pagination-btn">
                <Pagination />
              </ul>
            )} */}
          </div>
        </div>
      </section>
      <ShopFilter setProducts={setProducts} />
    </>
  );
}
