"use client";
import ShopDefault from "@/components/shop/ShopDefault";
import { useGetCategory } from "@/hooks/useCategory";
import { useSearchParams } from "next/navigation";
import React from "react";
export default function page() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const categoryId = searchParams.get("id");

  const { data } = useGetCategory(categoryId);
  return (
    <>
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{category}</div>
        </div>
      </div>
      <ShopDefault data={data?.services} />
    </>
  );
}
