import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import axiosInstance from "@/config/axios";

// Define the TypeScript interface for orders
interface OrderItem {
  id: number;
  service: {
    name: string;
  };
  total_price: string;
}

interface Order {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  delivery_option: string;
  created_at: string;
  order_items: OrderItem[];
  comment?: string;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("/orders");
        setOrders(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format date to more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate total order price
  const calculateTotalPrice = (orderItems: OrderItem[]) => {
    return orderItems
      .reduce((total, item) => total + parseFloat(item.total_price), 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white px-2 pb-1 pt-2 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs sm:text-theme-sm sm:px-4 sm:py-2.5 font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Filter
          </button>
          <button className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs sm:text-theme-sm sm:px-4 sm:py-2.5 font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        {/* Mobile View - Card Layout */}
        <div className="block sm:hidden">
          {orders.map((order) => (
            <div
              key={order.id}
              className="mb-4 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">Order #{order.id}</span>
                <Badge
                  size="sm"
                  color={
                    order.delivery_option === "local"
                      ? "success"
                      : order.delivery_option === "international"
                      ? "warning"
                      : "error"
                  }
                >
                  {order.delivery_option}
                </Badge>
              </div>
              <div className="mb-2">
                <p className="font-medium text-sm text-gray-800 dark:text-white/90">
                  {order.firstname} {order.lastname}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {order.email}
                </p>
              </div>
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Services:
                </p>
                {order.order_items.map((item) => (
                  <p
                    key={item.id}
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {item.service.name}
                  </p>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Total: ${calculateTotalPrice(order.order_items)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(order.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Table Layout */}
        <Table className="hidden sm:table w-full">
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs sm:text-theme-xs dark:text-gray-400"
              >
                Order ID
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs sm:text-theme-xs dark:text-gray-400"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs sm:text-theme-xs dark:text-gray-400"
              >
                Services
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs sm:text-theme-xs dark:text-gray-400"
              >
                Total Price
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs sm:text-theme-xs dark:text-gray-400"
              >
                Delivery
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-xs sm:text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map((order) => (
              <TableRow key={order.id} className="">
                <TableCell className="py-3 text-gray-500 text-xs sm:text-theme-sm dark:text-gray-400">
                  #{order.id}
                </TableCell>
                <TableCell className="py-3">
                  <div>
                    <p className="font-medium text-gray-800 text-xs sm:text-theme-sm dark:text-white/90">
                      {order.firstname} {order.lastname}
                    </p>
                    <span className="text-gray-500 text-xs sm:text-theme-xs dark:text-gray-400">
                      {order.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-xs sm:text-theme-sm dark:text-gray-400">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="text-xs sm:text-theme-sm">
                      {item.service.name}
                    </div>
                  ))}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-xs sm:text-theme-sm dark:text-gray-400">
                  ${calculateTotalPrice(order.order_items)}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-xs sm:text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      order.delivery_option === "local"
                        ? "success"
                        : order.delivery_option === "international"
                        ? "warning"
                        : "error"
                    }
                  >
                    {order.delivery_option}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-xs sm:text-theme-xs dark:text-gray-400">
                  {formatDate(order.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
