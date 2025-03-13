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

  const getProductTotal = (product) => {
    // Ensure quantity is always at least 1
    const qty = Math.max(1, quantity);

    // Calculate base price
    const basePrice = product?.base_price * qty;

    // Get extra tax fields, prioritizing temporary changes
    const extraTaxFields =
      tempCartChanges?.[product.id] || product?.extraTaxFields || {};

    // Calculate extra tax total
    const extraTaxTotal = Object.values(extraTaxFields).reduce(
      (sum, field) => sum + (Number(field.extra_tax) || 0),
      0
    );

    // Total price is base price plus extra taxes for the entire quantity
    const totalPrice = basePrice + extraTaxTotal * qty;

    return Number(totalPrice.toFixed(2));
  };

  const fetchCartData = async () => {
    setIsLoadingCart(true);
    try {
      const response = await axiosInstance.get("/carts");

      // Process cart items to handle nested service data
      // In fetchCartData function
      let cartItems = Array.isArray(response.data) ? response.data : [];
      const subTotal = cartItems.reduce(
        (sum, item) => sum + (item.total_price || 0),
        0
      );

      setSubtotal(subTotal); // Add this line to update the subtotal state

      // If the response has a data property and it's an array, use that instead
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        cartItems = response.data.data;
      }

      // Process and normalize the cart data
      const processedCartItems = cartItems.map((item) => {
        const serviceData = item.service || {};

        // Calculate total price including extra taxes
        const basePrice = parseFloat(serviceData.base_price || 0);
        const quantity = parseInt(item.quantity || 1, 10);

        // Calculate extra tax total
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

        // Calculate total price (base price * quantity + extra taxes * quantity)
        // const totalPrice = basePrice * quantity + extraTaxTotal * quantity;

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

          // Add service details for easy access
          name: serviceData.name || "Unknown Service",
          title: serviceData.title || serviceData.name || "Unknown Service",
          description: serviceData.description || "",
          base_price: basePrice,
          icon: serviceData.icon || "/placeholder-image.jpg",
          category_id: serviceData.category_id || null,

          // Keep the original service object
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

  // Add product to cart using API
  const addProductToCart = async (cartData) => {
    const response = await axiosInstance.post("/carts", cartData);

    if (response.data.success) {
      // Refresh cart data from server after adding
      await fetchCartData();
      openCartModal();

      toast.success("Item added to cart", {
        position: "top-right",
        autoClose: 3000,
      });
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

      // Make sure we have a valid base price
      if (!basePrice) {
        basePrice = cartItem.base_price;
      }

      // Update the cart item via API
      const response = await axiosInstance.patch(`cart/${id}/update-quantity`, {
        condition: condition,
        base_price: basePrice,
      });

      // Return the response so we can await it
      return response;
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      toast.error("Failed to update quantity", {
        position: "top-right",
        autoClose: 3000,
      });
      // Re-throw the error so we can catch it in the calling function
      return Promise.reject(error);
    }
  };

  // Remove item from cart using API
  const removeItemFromCart = async (id) => {
    try {
      const response = await axiosInstance.delete(`/carts/${id}`);

      if (response.data.success || response.status === 200) {
        // Refresh cart data from server after removing
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

  // Check if a product is in the cart
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
