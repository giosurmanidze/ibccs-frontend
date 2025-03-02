"use client";
import React from "react";

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Order #{order.id} Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg
              className="w-5 h-5"
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

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-3 text-gray-900">
                Customer Information
              </h4>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {order.firstname}{" "}
                  {order.lastname}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {order.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {order.phone_number}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {order.address}
                </p>
                <p>
                  <span className="font-medium">City:</span> {order.city}
                </p>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-3 text-gray-900">
                Order Information
              </h4>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Status:</span>{" "}
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
                    {order.status || "Processing"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Date Created:</span>{" "}
                  {formatDate(order.created_at)}
                </p>
                <p>
                  <span className="font-medium">Delivery Option:</span>{" "}
                  {order.delivery_option}
                </p>
                {order.comment && (
                  <p>
                    <span className="font-medium">Note:</span> {order.comment}
                  </p>
                )}
                <p className="text-lg font-medium text-green-700">
                  <span className="font-medium">Total Amount:</span>{" "}
                  {formatCurrency(calculateOrderTotal())}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-3 text-gray-900">
              Services Ordered
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Service
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Details
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items?.map((item, index) => {
                    const serviceDetails = parseServiceDetails(
                      item.service_details
                    );
                    return (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.service?.name || `Service #${item.service_id}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs space-y-1">
                            {serviceDetails.fields?.map((field, fieldIndex) => (
                              <div key={fieldIndex}>
                                <span className="font-medium">
                                  {field.name}:
                                </span>{" "}
                                {field.type === "file" ? (
                                  <a
                                    href={field.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View File
                                  </a>
                                ) : (
                                  <span>{field.value}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatCurrency(getItemPrice(item))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="font-semibold text-gray-900">
                  <tr>
                    <th
                      scope="row"
                      colSpan="2"
                      className="px-4 py-3 text-right"
                    >
                      Total
                    </th>
                    <td className="px-4 py-3">
                      {formatCurrency(calculateOrderTotal())}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
