"use client";
import { useGetServices } from "@/hooks/useGetServices";
import { openCartModal } from "@/utlis/openCartModal";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
import axiosInstance from "@/config/axios";
import { toast } from "react-toastify";

const dataContext = React.createContext();

export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const [cartProducts, setCartProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  useEffect(() => {
    fetchCartData();
  }, []);

  useEffect(() => {
    const subtotal = cartProducts
      .map((product) => {
        const productTotal =
          product.quantity * product.base_price +
          (product.extraTaxFields
            ? Object.values(product.extraTaxFields).reduce(
                (sum, field) => sum + (Number(field.extra_tax) || 0),
                0
              )
            : 0);
        return productTotal;
      })
      .reduce((accumulator, productTotal) => accumulator + productTotal, 0);

    setTotalPrice(subtotal);
  }, [cartProducts]);

  const fetchCartData = async () => {
    setIsLoadingCart(true);
    try {
      const response = await axiosInstance.get("/carts");
      let cartItems = Array.isArray(response.data) ? response.data : [];
      const subTotal = cartItems.reduce(
        (sum, item) => sum + (item.total_price || 0),
        0
      );

      setSubtotal(subTotal);

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        cartItems = response.data.data;
      }

      const processedCartItems = cartItems.map((item) => {
        const serviceData = item.service || {};

        const basePrice = parseFloat(serviceData.base_price || 0);
        const quantity = parseInt(item.quantity || 1, 10);

        const extraTaxTotal = item.extra_tax_fields
          ? item.extra_tax_fields.reduce((sum, field) => {
              return sum + (Number(field.extra_tax) || 0);
            }, 0)
          : item.extraTaxFields
          ? Object.values(item.extraTaxFields).reduce(
              (sum, field) => sum + (Number(field.extra_tax) || 0),
              0
            )
          : 0;

        return {
          ...item,
          id: item.id,
          service_id: item.service_id,
          quantity: quantity,
          total_price: item.total_price,
          extraTaxFields: item.extra_tax_fields
            ? item.extra_tax_fields.reduce((acc, field) => {
                acc[field.name] = field;
                return acc;
              }, {})
            : item.extraTaxFields || {},

          name: serviceData.name || "Unknown Service",
          title: serviceData.title || serviceData.name || "Unknown Service",
          description: serviceData.description || "",
          base_price: basePrice,
          icon: serviceData.icon || "/placeholder-image.jpg",
          category_id: serviceData.category_id || null,

          service: serviceData,
        };
      });
      setCartProducts(processedCartItems);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      toast.error("Failed to load cart items", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoadingCart(false);
    }
  };

  const addProductToCart = async (cartData) => {
    const response = await axiosInstance.post("/carts", cartData);

    if (response.data.success) {
      await fetchCartData();
      openCartModal();
    }
  };

  const updateQuantity = async (id, condition, basePrice) => {
    try {
      const cartItem = cartProducts.find((item) => item.id == id);

      if (!cartItem) {
        toast.error("Item not found in cart", {
          position: "top-right",
          autoClose: 3000,
        });
        return Promise.reject(new Error("Item not found in cart"));
      }

      if (!basePrice) {
        basePrice = cartItem.base_price;
      }

      const response = await axiosInstance.patch(`cart/${id}/update-quantity`, {
        condition: condition,
        base_price: basePrice,
      });

      return response;
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      toast.error("Failed to update quantity", {
        position: "top-right",
        autoClose: 3000,
      });
      return Promise.reject(error);
    }
  };

  const removeItemFromCart = async (id) => {
    try {
      const response = await axiosInstance.delete(`/carts/${id}`);

      if (response.data.success || response.status === 200) {
        await fetchCartData();

        toast.success("Item removed from cart", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const isAddedToCartProducts = (id) => {
    return cartProducts.some((item) => item.service_id == id);
  };

  const contextElement = {
    cartProducts,
    setCartProducts,
    totalPrice,
    isLoadingCart,
    addProductToCart,
    isAddedToCartProducts,
    updateQuantity,
    removeItemFromCart,
    subtotal,
    fetchCartData,
  };

  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
