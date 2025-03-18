"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/config/axios";
import EnhancedOrderDetailsModal from "@/components/OrderDetailsModal";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const getFilteredOrders = () => {
    let filteredOrders = orders;

    if (statusFilter !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === statusFilter
      );
    }
    return filteredOrders;
  };
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance("/user");
        const userData = response.data.user;
        setOrders(userData.orders);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <div className="container !mx-auto !px-4 !py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow"></div>
      <div className="w-full !rounded-2xl border border-gray-200 overflow-hidden !shadow-xl bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="!p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
          <div className="flex !flex-col !md:flex-row !md:items-center justify-between !gap-4">
            <div>
              <h2 className="!text-2xl font-bold text-gray-900 dark:text-white">
                Orders History
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap !gap-2 !mt-6">
            <button
              onClick={() => setStatusFilter("all")}
              className={`!px-4 !py-2 !rounded-full !text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
                statusFilter === "all"
                  ? "bg-black text-white hover:bg-blue-600 active:bg-blue-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`!px-4 !py-2 !rounded-full !text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
                statusFilter === "pending"
                  ? "bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("processing")}
              className={`!px-4 !py-2 !rounded-full !text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
                statusFilter === "processing"
                  ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`!px-4 !py-2 !rounded-full !text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
                statusFilter === "completed"
                  ? "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`!px-4 !py-2 !rounded-full !text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
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
                <p className="!text-2xl font-bold text-gray-900 dark:text-white">
                  {orders?.length}
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
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pending Orders
                </p>
                <p className="!text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    getFilteredOrders()
                      .filter((s) => s.status === "pending")
                      .map((s) => ({ id: s.id, item: s.item })).length
                  }
                </p>
              </div>
              <div className="!p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300">
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
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="!text-sm text-gray-500 dark:text-gray-400">
                  Completed Orders
                </p>
                <p className="!text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    getFilteredOrders().filter(
                      (order) => order.status === "completed"
                    ).length
                  }
                </p>
              </div>
              <div className="!p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
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
          </div>
        </div>
        <div className="overflow-x-auto relative shadow-inner">
          <table className="w-full !text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="!text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300 sticky top-0">
              <tr>
                {" "}
                <th
                  scope="col"
                  className="!px-6 !py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
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
                </th>{" "}
                <th
                  scope="col"
                  className="!px-6 !py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    Services
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
                  View
                </th>
              </tr>
            </thead>
            <tbody>
              {getFilteredOrders().map((order) => (
                <tr
                  key={order.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <th className="!px-4 !py-4 text-gray-900 dark:text-white font-medium !w-20">
                    <div className="flex items-center">
                      <div
                        className={`!w-2 !h-2 rounded-full !mr-2 flex-shrink-0 ${
                          order.status === "completed"
                            ? "bg-green-500"
                            : order.status === "pending"
                            ? "bg-yellow-500"
                            : order.status === "cancelled"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <span className="truncate">#{order.id}</span>
                    </div>
                  </th>
                  {console.log("order", order)}

                  <td className="!px-4 !py-4 !w-40">
                    <div className="!max-h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 !pr-2">
                      {order.order_items?.map((item, index) => (
                        <div
                          key={index}
                          className="!mb-1.5 !last:mb-0 !text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center !min-w-0 !flex-1">
                            <div className="!w-1.5 !h-1.5 rounded-full bg-blue-500 !mr-1.5 !flex-shrink-0"></div>
                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                              {item.service?.name ||
                                `Service #${item.service_id}`}
                            </span>
                          </div>
                          <span className="!ml-2 text-gray-500 dark:text-gray-400 !flex-shrink-0">
                            {formatCurrency(getItemPrice(item))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(calculateOrderTotal(order))}
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {formatDate(order.created_at)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center !space-x-2">
                      <span
                        className={`!px-2.5 !py-1.5 !text-xs font-medium rounded-lg ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="!p-1.5 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        title="View Details"
                        onClick={() => openDetailsModal(order)}
                        aria-label="View Order Details"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
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
                  <td colSpan="8" className="!px-6 !py-12 !text-center">
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
        {isModalOpen && selectedOrder && (
          <EnhancedOrderDetailsModal
            order={selectedOrder}
            isOpen={isModalOpen}
            onClose={closeDetailsModal}
            mtClass="!mt-30"
            maxHeight="!max-h-[52vh]"
          />
        )}
      </div>
    </div>
  );
};

export default MyOrders;
