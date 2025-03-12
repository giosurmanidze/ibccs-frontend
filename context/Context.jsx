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
  const { data: services } = useGetServices();
  const [isMounted, setIsMounted] = useState(false);
  const [cartProducts, setCartProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Initialize the component and fetch cart data from API
  useEffect(() => {
    setIsMounted(true);

    // Fetch cart data from API when component mounts
    fetchCartData();
  }, []);

  // Calculate total price whenever cart changes
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      const productTotal =
        product.quantity * product.base_price +
        (product.extraTaxFields
          ? Object.values(product.extraTaxFields).reduce(
              (sum, field) => sum + (Number(field.extra_tax) || 0),
              0
            )
          : 0);
      return accumulator + productTotal;
    }, 0);

    setTotalPrice(subtotal);
  }, [cartProducts]);

  // Fetch cart data from API
  const fetchCartData = async () => {
    setIsLoadingCart(true);
    try {
      const response = await axiosInstance.get("/carts");

      // Process cart items to handle nested service data
      let cartItems = Array.isArray(response.data) ? response.data : [];

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
        // Get service data from the nested service object
        const serviceData = item.service || {};

        return {
          ...item,
          id: item.id,
          service_id: item.service_id,
          quantity: parseInt(item.quantity || 1, 10),
          total_price: parseFloat(item.total_price || 0),

          // Add service details for easy access
          name: serviceData.name || "Unknown Service",
          title: serviceData.title || serviceData.name || "Unknown Service",
          description: serviceData.description || "",
          base_price: parseFloat(serviceData.base_price || 0),
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
  const addProductToCart = async (id, qty = 1) => {
    // Prepare the cart item data
    const cartData = {
      service_id: id,
      quantity: qty,
      total_price: serviceToAdd.base_price * qty,
      fields: [], // Initialize with empty fields
    };

    // Add to cart via API
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

  // Update cart item quantity using API
  const updateQuantity = async (id, qty) => {
    const cartItem = cartProducts.find((item) => item.id == id);

    if (cartItem) {
      try {
        const quantity = parseInt(qty, 10);

        if (isNaN(quantity) || quantity < 1) {
          toast.error("Invalid quantity", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }

        // Update the cart item via API
        const response = await axiosInstance.patch(`/carts/${id}`, {
          quantity: quantity,
        });

        if (response.data.success || response.status === 200) {
          // Refresh cart data from server
          await fetchCartData();
          openCartModal();
        }
      } catch (error) {
        console.error("Error updating cart quantity:", error);
        toast.error("Failed to update quantity", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      // Item not in cart, add it
      addProductToCart(id, qty);
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
    fetchCartData,
  };

  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
