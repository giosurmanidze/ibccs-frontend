"use client";
import { allProducts } from "@/data/products";
import { useGetServices } from "@/hooks/useGetServices";
import { openCartModal } from "@/utlis/openCartModal";
import React, { useEffect, useState } from "react";
import { useContext } from "react";

const dataContext = React.createContext();

export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const { data: services } = useGetServices();
  const [isMounted, setIsMounted] = useState(false);
  const [cartProducts, setCartProducts] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  // Initialize the component and check for client-side rendering
  useEffect(() => {
    setIsMounted(true);

    // Only load from localStorage on the client side
    if (typeof window !== "undefined") {
      const items = JSON.parse(localStorage.getItem("cartList") || "[]");
      if (items?.length) {
        setCartProducts(items);
      }
    }
  }, []);

  // Calculate total price whenever cart changes
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.base_price;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  // Save to localStorage only when on client and after cart changes
  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      localStorage.setItem("cartList", JSON.stringify(cartProducts));
    }
  }, [cartProducts, isMounted]);

  const addProductToCart = (id, qty) => {
    console.log(services);
    if (!cartProducts.filter((elm) => elm.id == id)[0]) {
      const item = {
        ...services.filter((elm) => elm.id == id)[0],
        quantity: qty ? qty : 1,
      };
      setCartProducts((pre) => [...pre, item]);
      openCartModal();
    }
  };

  const isAddedToCartProducts = (id) => {
    if (cartProducts.filter((elm) => elm.id == id)[0]) {
      return true;
    }
    return false;
  };

  const updateQuantity = (id, qty) => {
    if (isAddedToCartProducts(id)) {
      let item = cartProducts.filter((elm) => elm.id == id)[0];
      let items = [...cartProducts];
      const itemIndex = items.indexOf(item);

      item.quantity = qty / 1;
      items[itemIndex] = item;
      setCartProducts(items);

      openCartModal();
    } else {
      addProductToCart(id, qty);
    }
  };

  const contextElement = {
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    quickViewItem,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    updateQuantity,
  };

  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
