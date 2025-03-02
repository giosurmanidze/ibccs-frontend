"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import axiosInstance from "@/config/axios";
import { toast } from "react-toastify";
import OrderDetailsModal from "./OrderDetailsModal";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [AuthUser, setAuthUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("orders");
        console.log("Order data:", response.data);
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    // Get auth user
    const getAuthUser = async () => {
      try {
        const response = await axiosInstance.get("user");
        setAuthUser(response.data);
      } catch (error) {
        console.error("Error fetching auth user:", error);
      }
    };

    fetchOrders();
    getAuthUser();
  }, []);

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`orders/${orderId}`);
        // Remove order from state
        setOrders(orders.filter((order) => order.id !== orderId));
        toast.success("Order deleted successfully");
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
      }
    }
  };

  // Open modal with order details
  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Handle edit modal
  const openEditModal = (order) => {
    // Implement edit modal functionality here
    console.log("Open edit modal for order:", order);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0);
  };

  // Get service details for an item
  const parseServiceDetails = (item) => {
    if (item.service_details) {
      if (typeof item.service_details === "string") {
        try {
          return JSON.parse(item.service_details);
        } catch (error) {
          console.error("Error parsing service details:", error);
          return {};
        }
      }
      return item.service_details;
    }
    return {};
  };

  // Get total price for an item
  const getItemPrice = (item) => {
    // First check the direct total_price property
    if (item.total_price) {
      return parseFloat(item.total_price);
    }

    // Then check in service_details
    const details = parseServiceDetails(item);
    if (details && details.total_price) {
      return parseFloat(details.total_price);
    }

    // Default to 0 if no price is found
    return 0;
  };

  // Calculate total for an order
  const calculateOrderTotal = (order) => {
    if (!order.order_items || order.order_items.length === 0) return 0;

    return order.order_items.reduce((total, item) => {
      return total + parseFloat(item.total_price || 0);
    }, 0);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Orders Management
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex p-2 items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="table-search-orders"
            className="block ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for orders"
          />
        </div>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">
                <input
                  id="checkbox-all-search"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="checkbox-all-search" className="sr-only">
                  checkbox
                </label>
              </div>
            </th>
            <th scope="col" className="px-6 py-3">
              Order ID
            </th>
            <th scope="col" className="px-6 py-3">
              Customer
            </th>
            <th scope="col" className="px-6 py-3">
              Services
            </th>
            <th scope="col" className="px-6 py-3">
              Total
            </th>
            <th scope="col" className="px-6 py-3">
              Date
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
            <th scope="col" className="px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="w-4 p-4">
                <div className="flex items-center">
                  <input
                    id={`checkbox-table-search-${order.id}`}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor={`checkbox-table-search-${order.id}`}
                    className="sr-only"
                  >
                    checkbox
                  </label>
                </div>
              </td>
              <th
                scope="row"
                className="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
              >
                #{order.id}
              </th>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold">
                      {order.firstname} {order.lastname}
                    </div>
                    <div className="text-xs text-gray-500">{order.email}</div>
                    <div className="text-xs text-gray-500">
                      {order.phone_number}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-xs">
                  {order.order_items?.map((item, index) => (
                    <div key={index} className="mb-1 last:mb-0 text-xs">
                      • {item.service?.name || `Service #${item.service_id}`}
                      <span className="ml-1 text-gray-500">
                        {formatCurrency(getItemPrice(item))}) (
                        {item.total_price}){console.log(item)}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 font-medium">
                {formatCurrency(calculateOrderTotal(order))}
                {console.log(order)}
              </td>
              <td className="px-6 py-4">{formatDate(order.created_at)}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status || "processing"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    disabled={AuthUser?.role?.name !== "Admin"}
                    className="font-medium text-green-600 dark:text-green-500 hover:underline"
                    onClick={() => openEditModal(order)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke={
                        AuthUser?.role?.name !== "Admin"
                          ? "grey"
                          : "currentColor"
                      }
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={AuthUser?.role?.name !== "Admin"}
                    className="font-medium text-red-600 dark:text-red-500 hover:underline"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke={
                        AuthUser?.role?.name !== "Admin"
                          ? "grey"
                          : "currentColor"
                      }
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    onClick={() => openDetailsModal(order)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr className="bg-white dark:bg-gray-800">
              <td colSpan="8" className="px-6 py-4 text-center">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={closeDetailsModal}
        />
      )}
    </div>
  );
};

export default OrdersTable;
