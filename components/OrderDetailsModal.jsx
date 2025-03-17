"use client";
import React, { useEffect } from "react";

const EnhancedOrderDetailsModal = ({
  order,
  isOpen,
  onClose,
  mtClass,
  maxHeight,
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  // Parse service_details JSON if it's a string
  const parseServiceDetails = (details) => {
    if (typeof details === "string") {
      try {
        return JSON.parse(details);
      } catch (error) {
        console.error("Error parsing service details:", error);
        return { fields: [] };
      }
    }
    return details || { fields: [] };
  };

  // Get total price for an item
  const getItemPrice = (item) => {
    // First check the direct total_price property
    if (item.total_price) {
      return parseFloat(item.total_price);
    }

    // Then check in service_details
    const details = parseServiceDetails(item.service_details);
    if (details && details.total_price) {
      return parseFloat(details.total_price);
    }

    // Default to 0 if no price is found
    return 0;
  };

  // Calculate total for an order
  const calculateOrderTotal = () => {
    if (!order.order_items || order.order_items.length === 0) {
      return 0;
    }

    return order.order_items.reduce((total, item) => {
      return total + getItemPrice(item);
    }, 0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-800 dark:text-green-300",
          icon: "text-green-500",
          border: "border-green-200 dark:border-green-800",
        };
      case "pending":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-800 dark:text-yellow-300",
          icon: "text-yellow-500",
          border: "border-yellow-200 dark:border-yellow-800",
        };
      case "cancelled":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-800 dark:text-red-300",
          icon: "text-red-500",
          border: "border-red-200 dark:border-red-800",
        };
      case "processing":
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-300",
          icon: "text-blue-500",
          border: "border-blue-200 dark:border-blue-800",
        };
    }
  };

  const statusColors = getStatusColors(order.status);

  return (
    <div
      className={`fixed inset-0 ${mtClass} z-50 flex items-center justify-center overflow-auto  backdrop-blur-sm transition-all duration-300 dark:bg-gray-700 dark:bg-opacity-40`}
      onClick={onClose}
    >
      <div
        className="relative !w-full !max-w-4xl !mx-auto bg-white dark:bg-gray-800 !rounded-2xl !shadow-2xl transform transition-all duration-300 dark:border dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex  items-center justify-between !p-6 !border-b !border-gray-200 dark:border-gray-700 !bg-gradient-to-r !from-gray-50 !to-white dark:from-gray-800 dark:to-gray-750 !rounded-t-2xl">
          <div className="flex items-center !space-x-4">
            <div
              className={`!w-10 !h-10 !rounded-full flex items-center justify-center ${statusColors.bg}`}
            >
              {order.status === "completed" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${statusColors.icon}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : order.status === "pending" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${statusColors.icon}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : order.status === "cancelled" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${statusColors.icon}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${statusColors.icon}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <div>
              <h3 className="!text-xl font-bold text-gray-900 dark:text-white">
                Order #{order.id}
              </h3>
              <p className="!text-sm text-gray-500 dark:text-gray-400">
                Created on {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center !space-x-3">
            <span
              className={`!px-4 !py-1.5 !rounded-full !text-sm font-medium ${statusColors.bg} ${statusColors.text} capitalize`}
            >
              {order.status || "Processing"}
            </span>
            <button
              onClick={onClose}
              className="!p-2 text-gray-400 !bg-gray-100 dark:bg-gray-700 !rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              aria-label="Close"
            >
              <svg
                className="!w-5 !h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`!p-6 max-h-[70vh] ${maxHeight} overflow-y-auto custom-scrollbar`}
        >
          <div className="grid !grid-cols-1 !md:grid-cols-2 !gap-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-600 dark:text-purple-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h4 className="!text-lg ml-3! font-bold text-gray-900 dark:text-white">
                  Order Details
                </h4>
              </div>

              <div className="!space-y-3 !text-sm">
                <div className="flex items-center !border-b !border-gray-100 !dark:border-gray-700 pb-2">
                  <span className="!w-32 font-medium text-gray-500 dark:text-gray-400">
                    Delivery Option:
                  </span>
                  <span className="!flex-1 text-gray-900 dark:text-white">
                    {order.delivery_option || "Standard"}
                  </span>
                </div>

                {order.comment && (
                  <div className="!border-b !border-gray-100 !dark:border-gray-700 !pb-2">
                    <span className="!block !w-32 font-medium text-gray-500 dark:text-gray-400 !mb-1">
                      Note:
                    </span>
                    <div className="!ml-2 !p-2 !bg-gray-50 dark:bg-gray-700/50 rounded !text-gray-700 dark:text-gray-300 italic">
                      {order.comment}
                    </div>
                  </div>
                )}

                <div className="flex items-center !pt-2">
                  <span className="!w-32 font-medium text-gray-500 dark:text-gray-400">
                    Total Amount:
                  </span>
                  <span className="!flex-1 !text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(calculateOrderTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="!mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="flex items-center !px-5 !py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="!p-2 bg-green-100 dark:bg-green-900/30 rounded-full !mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="!h-5 !w-5 text-green-600 dark:text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <h4 className="!text-lg !font-bold text-gray-900 dark:text-white">
                Services Ordered
              </h4>
            </div>

            <div className="!overflow-x-auto">
              <table className="w-full !text-sm !text-left">
                <thead className="!text-xs text-gray-700 dark:text-gray-300 uppercase !bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="!px-6 !py-3 font-semibold">
                      Service
                    </th>
                    <th scope="col" className="!px-6 !py-3 font-semibold">
                      Details
                    </th>
                    <th scope="col" className="!px-6 !py-3 font-semibold">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.order_items?.map((item, index) => {
                    const serviceDetails = parseServiceDetails(
                      item.service_details
                    );
                    return (
                      <tr
                        key={index}
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                      >
                        <td className="!px-6 !py-4 font-medium text-gray-900 dark:text-white">
                          {item.service?.name || `Service #${item.service_id}`}
                        </td>
                        <td className="!px-6 !py-4">
                          <div className="!text-xs !space-y-2 text-gray-600 dark:text-gray-300">
                            {serviceDetails.fields?.map((field, fieldIndex) => (
                              <div key={fieldIndex} className="flex">
                                <span className="font-medium !min-w-[80px] !mr-2">
                                  {field.name.replace(/(_\d+)?:?$/, "")}:
                                </span>
                                {field.type === "file" ? (
                                  <a
                                    href={field.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                  >
                                    <span>View File</span>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 ml-1"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                    </svg>
                                  </a>
                                ) : (
                                  <span className="!text-gray-800 dark:text-gray-200">
                                    {(() => {
                                      try {
                                        if (
                                          field.value &&
                                          typeof field.value === "string" &&
                                          field.value.startsWith("[") &&
                                          field.value.endsWith("]")
                                        ) {
                                          const parsed = JSON.parse(
                                            field.value
                                          );
                                          return Array.isArray(parsed)
                                            ? parsed.join(", ")
                                            : field.value;
                                        }
                                        return field.value;
                                      } catch (e) {
                                        return field.value;
                                      }
                                    })()}
                                  </span>
                                )}
                              </div>
                            ))}
                            {(!serviceDetails.fields ||
                              serviceDetails.fields.length === 0) && (
                              <span className="text-gray-500 dark:text-gray-400 italic">
                                No additional details
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="!px-6 !py-4 font-medium text-gray-900 dark:text-white">
                          {formatCurrency(getItemPrice(item))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th
                      scope="row"
                      colSpan="2"
                      className="!px-6 !py-4 !text-right"
                    >
                      Total
                    </th>
                    <td className="!px-6 !py-4">
                      {formatCurrency(calculateOrderTotal())}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between !p-6 !border-t !border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <div className="!text-sm !text-gray-500 dark:text-gray-400">
            Order ID: <span className="font-mono font-medium">{order.id}</span>
          </div>

          <div className="flex !space-x-3">
            <button
              onClick={() => window.print()}
              className="!px-4 !py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                  clipRule="evenodd"
                />
              </svg>
              Print
            </button>
            <button
              onClick={onClose}
              className="!px-4 !py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOrderDetailsModal;
