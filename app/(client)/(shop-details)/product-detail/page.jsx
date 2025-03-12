"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import Products from "@/components/shopDetails/Products";
import { useGetService } from "@/hooks/useGetService";
import { useGetCategory } from "@/hooks/useCategory";

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const serviceId = searchParams.get("serviceId");

  const { data: product } = useGetService(serviceId);
  const { data: category } = useGetCategory(categoryId);

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
          </div>
        </div>
      </div>
      <DetailsOuterZoom product={product} />
      <Products />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading product details...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}
