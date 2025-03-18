"use client";
import React, { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import axiosInstance from "@/config/axios";

export const EcommerceMetrics = () => {
  const [metricsData, setMetricsData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    customersCount: 0,
    completedOrders: 0,
    pendingOrders: 0,
    ordersGrowth: 0,
    revenueGrowth: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const response = await axiosInstance.get("orders/dashboard-metrics");
        const metrics = response.data.data;

        setMetricsData({
          totalOrders: metrics.total_orders,
          totalRevenue: metrics.total_revenue,
          customersCount: metrics.customers_count,
          completedOrders: metrics.completed_orders,
          pendingOrders: metrics.pending_orders,
          ordersGrowth: metrics.orders_growth,
          revenueGrowth: metrics.revenue_growth,
          loading: false,
        });
      } catch (error) {
        console.error("Fallback method also failed:");
        setMetricsData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
      {/* Customer Card */}
      <div className="group overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:translate-y-1 hover:shadow-xl dark:from-gray-800 dark:to-gray-900">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-50/30 transition-all group-hover:ring-blue-50/50 dark:bg-blue-900/30 dark:ring-blue-900/20">
              <GroupIcon className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="w-20 text-center">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                Customers
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metricsData.loading ? (
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                ) : (
                  metricsData.customersCount
                )}
              </h4>
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                total
              </span>
            </div>
            <div className="mt-1 h-1 w-16 rounded bg-blue-200 dark:bg-blue-800"></div>
          </div>
        </div>
      </div>

      {/* Orders Card */}
      <div className="group overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:translate-y-1 hover:shadow-xl dark:from-gray-800 dark:to-gray-900">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 ring-4 ring-purple-50/30 transition-all group-hover:ring-purple-50/50 dark:bg-purple-900/30 dark:ring-purple-900/20">
              <BoxIconLine className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="w-20 text-center">
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                Orders
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="flex items-baseline">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metricsData.loading ? (
                    <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  ) : (
                    metricsData.totalOrders
                  )}
                </h4>
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  total
                </span>
              </div>
              <div className="mt-1 h-1 w-16 rounded bg-purple-200 dark:bg-purple-800"></div>
            </div>

            {metricsData.ordersGrowth && (
              <div
                className={`flex items-center space-x-1 rounded-full px-3 py-1 text-sm font-medium ${
                  metricsData.ordersGrowth >= 0
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {metricsData.ordersGrowth >= 0 ? (
                  <ArrowUpIcon className="size-3" />
                ) : (
                  <ArrowDownIcon className="size-3" />
                )}
                <span>
                  {Math.abs(metricsData.ordersGrowth || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completed Orders Card */}
      <div className="group overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:translate-y-1 hover:shadow-xl dark:from-gray-800 dark:to-gray-900">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 ring-4 ring-green-50/30 transition-all group-hover:ring-green-50/50 dark:bg-green-900/30 dark:ring-green-900/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6 text-green-600 dark:text-green-400"
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
            <div className="w-20 text-center">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-green-600 dark:bg-green-900/30 dark:text-green-400">
                Completed
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metricsData.loading ? (
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                ) : (
                  metricsData.completedOrders
                )}
              </h4>
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                orders
              </span>
            </div>
            <div className="mt-1 h-1 w-16 rounded bg-green-200 dark:bg-green-800"></div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="group overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:translate-y-1 hover:shadow-xl dark:from-gray-800 dark:to-gray-900">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 ring-4 ring-amber-50/30 transition-all group-hover:ring-amber-50/50 dark:bg-amber-900/30 dark:ring-amber-900/20">
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                €
              </span>
            </div>
            <div className="w-20 text-center">
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                Revenue
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="flex items-baseline">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metricsData.loading ? (
                    <div className="h-8 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  ) : (
                    `${metricsData.totalRevenue} Euro`
                  )}
                </h4>
              </div>
              <div className="mt-1 h-1 w-16 rounded bg-amber-200 dark:bg-amber-800"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
