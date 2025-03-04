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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metricsData.loading ? "Loading..." : metricsData.customersCount}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            8.32%
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metricsData.loading ? "Loading..." : metricsData.totalOrders}
            </h4>
          </div>

          <Badge color={metricsData.ordersGrowth >= 0 ? "success" : "error"}>
            {metricsData.ordersGrowth >= 0 ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon />
            )}
            {Math.abs(metricsData.ordersGrowth || 0).toFixed(2)}%
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6 text-green-600"
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
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Completed Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metricsData.loading ? "Loading..." : metricsData.completedOrders}
            </h4>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          $
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Revenue
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metricsData.loading
                ? "Loading..."
                : formatCurrency(metricsData.totalRevenue)}
            </h4>
          </div>

          <Badge color={metricsData.revenueGrowth >= 0 ? "success" : "error"}>
            {metricsData.revenueGrowth >= 0 ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon />
            )}
            {Math.abs(metricsData.revenueGrowth || 0).toFixed(2)}%
          </Badge>
        </div>
      </div>
    </div>
  );
};
