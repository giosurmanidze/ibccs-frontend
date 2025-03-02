"use client";
import React, { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import axiosInstance from "@/config/axios";

export const EcommerceMetrics = () => {
  const [ordersData, setOrdersData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    customersCount: 0,
    ordersGrowth: 0,
    revenueGrowth: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders data
        const ordersResponse = await axiosInstance.get("orders");
        const orders = ordersResponse.data;

        // Calculate metrics
        const totalOrders = orders.length;

        // Calculate total revenue from all orders
        const totalRevenue = orders.reduce((total, order) => {
          // Sum each order's items' total_price
          const orderTotal = order.order_items.reduce((itemsTotal, item) => {
            return itemsTotal + parseFloat(item.total_price || 0);
          }, 0);

          return total + orderTotal;
        }, 0);

        // Get unique customers count
        const uniqueCustomers = new Set(orders.map((order) => order.email))
          .size;

        // For demo purposes, you could calculate growth metrics compared to previous periods
        // Here we're just using placeholder growth percentages

        setOrdersData({
          totalOrders,
          totalRevenue,
          customersCount: uniqueCustomers,
          ordersGrowth: 9.5,
          revenueGrowth: 11.2,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching metrics data:", error);
        setOrdersData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
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
              {ordersData.loading ? "Loading..." : ordersData.customersCount}
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
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {ordersData.loading ? "Loading..." : ordersData.totalOrders}
            </h4>
          </div>

          <Badge color={ordersData.ordersGrowth >= 0 ? "success" : "error"}>
            {ordersData.ordersGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(ordersData.ordersGrowth).toFixed(2)}%
          </Badge>
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
              {ordersData.loading
                ? "Loading..."
                : formatCurrency(ordersData.totalRevenue)}
            </h4>
          </div>

          <Badge color={ordersData.revenueGrowth >= 0 ? "success" : "error"}>
            {ordersData.revenueGrowth >= 0 ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon />
            )}
            {Math.abs(ordersData.revenueGrowth).toFixed(2)}%
          </Badge>
        </div>
      </div>
    </div>
  );
};
