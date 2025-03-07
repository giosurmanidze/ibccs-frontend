"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { layouts } from "@/data/shop";
import ProductGrid from "./ProductGrid";
import ShopFilter from "./ShopFilter";
import Sorting from "./Sorting";
import { useGetCategory } from "@/hooks/useCategory";
import { useGetCategories } from "@/hooks/useGetCategories";

function ShopDefaultContent() {
  const [gridItems, setGridItems] = useState();
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
          <div className="tf-shop-control grid-2 align-items-center">
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
            <div className="tf-control-sorting d-flex justify-content-end">
              <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                <Sorting setFinalSorted={setFinalSorted} category={services} />
              </div>
            </div>
          </div>
          <div className="wrapper-control-shop">
            <div className="meta-filter-shop" />
            <ProductGrid gridItems={gridItems} allproducts={services} />
          </div>
        </div>
      </section>
      <ShopFilter setProducts={setProducts} />
    </>
  );
}

export default function ShopDefault() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopDefaultContent />
    </Suspense>
  );
}
