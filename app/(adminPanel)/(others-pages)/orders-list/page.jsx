import OrdersTable from "@/components/OrdersTable";
import React from "react";

const OrdersPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <OrdersTable />
      </div>
    </div>
  );
};

export default OrdersPage;
