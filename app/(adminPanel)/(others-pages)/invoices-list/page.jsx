"use client";

import React, { useState, useEffect } from "react";
import { Download, Eye, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import axiosInstance from "@/config/axios";

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/orders");
      console.log(response.data.data);
      setInvoices(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch invoices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await axiosInstance({
        url: `/download-invoice/${invoiceId}`,
        method: "GET",
        responseType: "blob",
      });

      const href = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", "invoice.pdf");
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handleViewPdf = async (invoiceId) => {
    try {
      const response = await axiosInstance({
        url: `/download-invoice/${invoiceId}`,
        method: "GET",
        responseType: "blob",
      });

      const pdfUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );

      window.open(pdfUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (error) {
      console.error("Failed to view PDF", error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-red-700">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchInvoices}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md inline-flex items-center transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
          <button
            onClick={fetchInvoices}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-md inline-flex items-center text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No invoices found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border-b p-4 text-gray-600 font-semibold">
                  Invoice #
                </th>
                <th className="border-b p-4 text-gray-600 font-semibold">
                  Date
                </th>
                <th className="border-b p-4 text-gray-600 font-semibold">
                  Amount
                </th>
                <th className="border-b p-4 text-gray-600 font-semibold">
                  Status
                </th>
                <th className="border-b p-4 text-gray-600 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-gray-50 border-b border-gray-100"
                >
                  {console.log(invoice)}
                  <td className="p-4 text-gray-800">
                    {invoice.invoiceNumber || invoice.id}
                  </td>
                  <td className="p-4 text-gray-800">
                    {formatDate(invoice.created_at)}
                  </td>
                  <td className="p-4 text-gray-800">
                    {formatCurrency(invoice.total_price)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {invoice.status
                        ? invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)
                        : "Unknown"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPdf(invoice.invoice.id)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded inline-flex items-center text-sm transition-colors"
                      >
                        <Eye className="mr-1.5 w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() =>
                          handleDownloadInvoice(invoice.invoice.id)
                        }
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded inline-flex items-center text-sm transition-colors"
                      >
                        <Download className="mr-1.5 w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoicesList;
