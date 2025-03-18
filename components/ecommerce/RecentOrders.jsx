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
import Link from "next/link";



export default function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("orders/recent");
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalPrice = (orderItems) => {
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
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg dark:from-gray-800 dark:to-gray-900">
      <div className="p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 rounded-full bg-indigo-500"></div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                Recent Orders
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {orders?.length} orders in total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 ">
            <Link
              href="/orders-list"
              className="group flex items-center cursor-pointer gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              See all
            </Link>
          </div>
        </div>
        <div className="block space-y-4 sm:hidden">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800/40"
            >
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                      #{order.id}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white/90">
                        #{order.id}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  <Badge
                    size="sm"
                    color={
                      order.delivery_option === "local"
                        ? "success"
                        : order.delivery_option === "international"
                        ? "warning"
                        : "error"
                    }
                    className="font-medium uppercase text-xs tracking-wider px-2 py-1"
                  >
                    {order.delivery_option}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center dark:bg-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4 text-gray-600 dark:text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {order.firstname} {order.lastname}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 pl-8">
                    {order.email}
                  </p>
                </div>

                <div className="mb-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Services:
                  </p>
                  <div className="space-y-1">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2"
                      >
                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {item.service?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-3 dark:border-gray-700">
                  <p className="text-base font-bold text-gray-800 dark:text-white">
                    ${calculateTotalPrice(order.order_items)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Table Layout */}
        <div className="hidden sm:block rounded-xl border border-gray-100 bg-white overflow-hidden dark:border-gray-700 dark:bg-gray-800/40">
          <Table className="w-full">
            {/* Table Header */}
            <TableHeader className="bg-gray-50 dark:bg-gray-800/60">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 px-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Order ID
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Services
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Total Price
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Delivery
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-4 font-medium text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400"
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {orders?.map((order) => (
                <TableRow
                  key={order.id}
                  className="group hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/60"
                >
                  <TableCell className="py-4 px-4 text-gray-700 dark:text-gray-300">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                      #{order.id}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {order.firstname} {order.lastname}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {order.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="space-y-1">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-2"
                        >
                          <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                          <span>{item.service?.name}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 font-bold text-gray-800 dark:text-white">
                    ${calculateTotalPrice(order.order_items)}
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <Badge
                      size="sm"
                      color={
                        order.delivery_option === "local"
                          ? "success"
                          : order.delivery_option === "international"
                          ? "warning"
                          : "error"
                      }
                      className="font-medium uppercase text-xs tracking-wider px-2 py-1"
                    >
                      {order.delivery_option}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(order.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
