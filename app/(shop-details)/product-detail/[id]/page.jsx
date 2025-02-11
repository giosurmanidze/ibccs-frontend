"use client";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import React from "react";
import Link from "next/link";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import ProductSinglePrevNext from "@/components/common/ProductSinglePrevNext";
import { useParams, useSearchParams } from "next/navigation";
import { useGetService } from "@/hooks/useGetService";
import { useGetCategory } from "@/hooks/useCategory";
export default function page() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  const { data: product } = useGetService(id);
  const { data: category } = useGetCategory(categoryId);
  console.log(categoryId)

  return (
    <>
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              <Link href={`/`} className="text">
                Home
              </Link>
              <i className="icon icon-arrow-right" />

              <span className="text">{category?.name}</span>
            </div>
            <ProductSinglePrevNext currentId={product?.id} />
          </div>
        </div>
      </div>
      <DetailsOuterZoom product={product} />
      <ShopDetailsTab />
      <Products />
      <RecentProducts />
    </>
  );
}
