"use client";

import { useContextElement } from "@/context/Context";

export default function CartLength({ color }) {
  const { cartProducts } = useContextElement();
  return <span style={{ color: color }}>{cartProducts.length}</span>;
}
