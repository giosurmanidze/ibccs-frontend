import OrdersTable from "@/components/OrdersTable";
import React from "react";

const OrdersPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Orders Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all customer orders
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <OrdersTable />
      </div>
    </div>
  );
};

export default OrdersPage;
