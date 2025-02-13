"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Shopcard28({ product }) {
  const { addProductToCart, isAddedToCartProducts } = useContextElement();

  return (
    <Link href={`product-detail/${product.id}?categoryId=${product.category_id}`} className="card-product style-8">
      <div class="bg-white rounded-3xl">
        <div className="d-flex justify-content-center gap-10 flex-column align-items-center px-4 py-5 px-sm-3 py-sm-4">
          <Image
            width={70}
            height={70}
            className="lazyload img-product"
            data-src={product.imgSrc}
            src={`http://localhost:8000/storage/${product.icon}`}
            alt="image-product"
          />
          <div class="row text-center justify-content-center">
            <div>
              <p class="fs-6 fs-lg-3 text-muted">
                <b>{product.name}</b>
              </p>
              <p class="mt-2 text-muted">{product.description}</p>
            </div>
            <div class="mt-4">
              <p>
                <span class="fs-1 text-dark fw-light">
                  ${product.base_price}
                </span>
                <span class="fs-6 text-muted"></span>
              </p>
            </div>
          </div>
        </div>
        <div class="px-4 pb-5 px-sm-5">
          <a
            className="btn btn-dark w-100 text-white text-sm rounded-pill py-2"
            onClick={() => addProductToCart(product.id)}
          >
            {isAddedToCartProducts(product.id)
              ? "Already Added"
              : "Add to cart"}
          </a>
        </div>
      </div>
    </Link>
  );
}
