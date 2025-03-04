"use client";
import React, { useState, useEffect } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [metricsData, setMetricsData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const response = await axiosInstance.get("orders/dashboard-metrics");
        const metrics = response.data.data;

        setMetricsData({
          totalOrders: metrics.total_orders,
          totalRevenue: metrics.total_revenue,
          loading: false,
        });
      } catch (error) {
        console.error("Fallback method also failed:");
        setMetricsData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardMetrics();
  }, []);

  const getFilteredOrders = () => {
    if (statusFilter === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrders(page);
  };

  const getPageNumbers = () => {
    const pages = [];

    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(lastPage - 1, currentPage + 1);

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < lastPage - 1) {
        pages.push("...");
      }

      pages.push(lastPage);
    }

    return pages;
  };
  const fetchOrders = async (page = 1) => {
    try {
      const response = await axiosInstance.get(`orders?page=${page}`);
      console.log(response.data);
      setOrders(response.data.data);
      setLoading(false);
      setCurrentPage(response.data.meta.current_page || page);
      setLastPage(response.data.meta.last_page || 1);
      setTotalOrders(response.data.meta.total || response.data.data.length);
      setPerPage(response.data.meta.per_page || 10);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const getAuthUser = async () => {
      try {
        const response = await axiosInstance.get("user");
        setAuthUser(response.data);
      } catch (error) {
        console.error("Error fetching auth user:", error);
      }
    };

    getAuthUser();
  }, []);

  const handleDeleteOrder = async (orderId) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`orders/${orderId}`);
        setOrders(orders.filter((order) => order.id !== orderId));
        toast.success("Order deleted successfully");
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
      }
    }
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0);
  };

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

  const getItemPrice = (item) => {
    if (item.total_price) {
      return parseFloat(item.total_price);
    }

    const details = parseServiceDetails(item);
    if (details && details.total_price) {
      return parseFloat(details.total_price);
    }

    return 0;
  };

  const calculateOrderTotal = (order) => {
    if (!order.order_items || order.order_items.length === 0) return 0;

    return order.order_items.reduce((total, item) => {
      return total + parseFloat(item.total_price || 0);
    }, 0);
  };

  const handleStatusSubmit = async (orderId, newStatus) => {
    try {
      await axiosInstance.patch(`orders/${orderId}/status`, {
        status: newStatus,
      });

      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setSelectedStatus((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });

      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };
  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 overflow-hidden shadow-xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Orders Management
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Manage and track customer orders
            </p>
          </div>

          <div className="relative group md:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
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
              className="block w-full pl-10 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white bg-opacity-80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search orders by ID, customer, email..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              statusFilter === "all"
                ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              statusFilter === "pending"
                ? "bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              statusFilter === "processing"
                ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              statusFilter === "completed"
                ? "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              statusFilter === "cancelled"
                ? "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metricsData.totalOrders}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metricsData.totalRevenue}
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span>+8.5% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {
                  orders
                    .filter((s) => s.status === "pending")
                    .map((s) => ({ id: s.id, item: s.item })).length
                }
              </p>
            </div>
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-yellow-600 dark:text-yellow-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Requires attention</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter((order) => order.status === "completed").length}
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span>+15% from last month</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto relative shadow-inner">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300 sticky top-0">
            <tr>
              <th scope="col" className="p-4 w-10">
                <div className="flex items-center">
                  <input
                    id="checkbox-all-search"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="checkbox-all-search" className="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center">
                  Order ID
                  <svg
                    className="w-3 h-3 ml-1.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                  </svg>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center">
                  Customer
                  <svg
                    className="w-3 h-3 ml-1.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Services
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center">
                  Total
                  <svg
                    className="w-3 h-3 ml-1.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                  </svg>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center">
                  Date
                  <svg
                    className="w-3 h-3 ml-1.5 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                  </svg>
                </div>
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
            {getFilteredOrders().map((order) => (
              <tr
                key={order.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <td className="w-4 p-4">
                  <div className="flex items-center">
                    <input
                      id={`checkbox-table-search-${order.id}`}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                  className="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white font-medium"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        order.status === "completed"
                          ? "bg-green-500"
                          : order.status === "pending"
                          ? "bg-yellow-500"
                          : order.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                    #{order.id}
                  </div>
                </th>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold mr-3">
                      {order.firstname?.charAt(0) || "?"}
                      {order.lastname?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {order.firstname} {order.lastname}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.email}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.phone_number}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs max-h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 pr-2">
                    {order.order_items?.map((item, index) => (
                      <div key={index} className="mb-1.5 last:mb-0 text-xs">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {item.service?.name ||
                              `Service #${item.service_id}`}
                          </span>
                        </div>
                        <div className="ml-3 text-gray-500 dark:text-gray-400">
                          {formatCurrency(getItemPrice(item))}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(calculateOrderTotal(order))}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <select
                      id={`order-status-${order.id}`}
                      value={selectedStatus?.[order.id] || order.status}
                      onChange={(e) => {
                        handleStatusSubmit(order.id, e.target.value);
                      }}
                      className={`block w-full p-2.5 text-sm rounded-lg focus:ring-2 ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800 border-green-300 focus:ring-green-500 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300 focus:ring-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800 border-red-300 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600"
                          : "bg-blue-100 text-blue-800 border-blue-300 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                      }`}
                    >
                      {["pending", "processing", "completed", "cancelled"].map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                            className="bg-white text-gray-800"
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      disabled={AuthUser?.role?.name !== "Admin"}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        AuthUser?.role?.name === "Admin"
                          ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      }`}
                      title={
                        AuthUser?.role?.name === "Admin"
                          ? "Edit Order"
                          : "Admin Only"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
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
                      className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      title="View Details"
                      onClick={() => openDetailsModal(order)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
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
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mb-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      No orders found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No orders match your search criteria.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1
                ? "text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"
                : "text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() =>
              currentPage < lastPage && handlePageChange(currentPage + 1)
            }
            disabled={currentPage === lastPage}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === lastPage
                ? "text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"
                : "text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing{" "}
              <span className="font-medium">
                {getFilteredOrders().length > 0
                  ? (currentPage - 1) * perPage + 1
                  : 0}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * perPage, getFilteredOrders().length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">{getFilteredOrders().length}</span>{" "}
              {statusFilter !== "all" && (
                <span className="italic">filtered</span>
              )}{" "}
              results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() =>
                  currentPage > 1 && handlePageChange(currentPage - 1)
                }
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"
                    : "bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === page
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:border-blue-500 dark:bg-gradient-to-r dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    } text-sm font-medium`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  currentPage < lastPage && handlePageChange(currentPage + 1)
                }
                disabled={currentPage === lastPage}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                  currentPage === lastPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600"
                    : "bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
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
