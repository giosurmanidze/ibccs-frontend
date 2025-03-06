"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/config/axios";
import { toast } from "react-toastify";
import ServiceFieldEditor from "./ServiceFieldEditor";
import { useAuth } from "@/context/AuthContext";

const ServicesTable = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const { user: AuthUser } = useAuth();

  const openEditorModal = (service = null) => {
    setServiceToEdit(service);
    setIsEditorOpen(true);
  };

  const closeEditorModal = () => {
    setIsEditorOpen(false);
    setServiceToEdit(null);
  };

  const handleServiceSave = (updatedService) => {
    if (serviceToEdit) {
      setServices(
        services.map((service) =>
          service.id === updatedService.id ? updatedService : service
        )
      );
      fetchServices();
    } else {
      setServices([...services, updatedService]);
    }
    closeEditorModal();
  };

  const getFilteredServices = () => {
    if (statusFilter === "all") {
      return services;
    }
    return services.filter((service) => service.status === statusFilter);
  };

  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get(`services`);
      console.log(response.data);

      if (Array.isArray(response.data.services)) {
        setServices(response.data.services);
      } else {
        setServices([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openDeleteModal = (service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      await axiosInstance.delete(`services/${serviceToDelete.id}`);
      setServices(
        services.filter((service) => service.id !== serviceToDelete.id)
      );
      toast.success("Service deleted successfully");
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setServiceToDelete(null);
  };

  const openDetailsModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0);
  };

  const handleStatusSubmit = async (serviceId, newStatus) => {
    try {
      await axiosInstance.patch(`services/${serviceId}/status`, {
        status: newStatus,
      });

      const updatedServices = services.map((service) =>
        service.id === serviceId ? { ...service, status: newStatus } : service
      );
      setServices(updatedServices);
      setSelectedStatus((prev) => {
        const updated = { ...prev };
        delete updated[serviceId];
        return updated;
      });

      toast.success("Service status updated successfully");
    } catch (error) {
      console.error("Error updating service status:", error);
      toast.error("Failed to update service status");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading services...</div>;
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 overflow-hidden shadow-xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isDeleteModalOpen && serviceToDelete && (
            <div className="fixed inset-0 bg-opacity-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl overflow-hidden">
                <div className="p-5">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Are you sure you want to delete
                    <span className="font-medium text-gray-900 dark:text-white">
                      {serviceToDelete.name}
                    </span>
                    ? This action cannot be undone.
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Service details:
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">ID:</span>
                      {serviceToDelete.id}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> $
                      {parseFloat(serviceToDelete.base_price).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleDeleteCancel}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Delete Service
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Services Management
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Manage your available services
            </p>
          </div>
          <div className="relative group md:w-80">
            <div className="relative">
              <div className="absolute inset-y-0 z-10  left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="table-search-services"
                className="block w-full pl-10 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white bg-opacity-80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search services by name, category..."
              />
            </div>
            <button
              onClick={() => openEditorModal(null)}
              className="px-4 py-2 bg-blue-500 text-white mt-5 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Create New Service
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              statusFilter === "all"
                ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              statusFilter === "active"
                ? "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
              statusFilter === "drafct"
                ? "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Draft
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Services
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {services.length}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Services
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {
                  services.filter((service) => service.status === "active")
                    .length
                }
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drafc Services
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {
                  services.filter((service) => service.status === "draft")
                    .length
                }
              </p>
            </div>
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto relative shadow-inner">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300 sticky top-0">
            <tr>
              <th scope="col" className="p-4 w-10">
                <div className="flex items-center">
                  <input
                    id="checkbox-all-search"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="checkbox-all-search" className="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center">
                  ID
                  <svg
                    className="w-3 h-3 ml-1.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                  </svg>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center">
                  Name
                  <svg
                    className="w-3 h-3 ml-1.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center">
                  Price
                  <svg
                    className="w-3 h-3 ml-1.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                  </svg>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center">
                  Created
                  <svg
                    className="w-3 h-3 ml-1.5 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {getFilteredServices().map((service) => (
              <tr
                key={service.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <td className="w-4 p-4">
                  <div className="flex items-center">
                    <input
                      id={`checkbox-table-search-${service.id}`}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor={`checkbox-table-search-${service.id}`}
                      className="sr-only"
                    >
                      checkbox
                    </label>
                  </div>
                </td>
                <th
                  scope="row"
                  className="px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white font-medium"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        service.status === "active"
                          ? "bg-green-500"
                          : service.status === "inactive"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                    #{service.id}
                  </div>
                </th>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {service.image && (
                      <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 overflow-hidden mr-3">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/40?text=No+Image";
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </div>
                      {service.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {service.category.name}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs text-sm text-gray-600 dark:text-gray-400">
                    {service.description ? (
                      service.description.length > 100 ? (
                        service.description.substring(0, 100) + "..."
                      ) : (
                        service.description
                      )
                    ) : (
                      <span className="text-gray-400 italic">
                        No description
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(service.base_price || 0)}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {formatDate(service.created_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <select
                      id={`service-status-${service.id}`}
                      value={selectedStatus?.[service.id] || service.status}
                      onChange={(e) => {
                        handleStatusSubmit(service.id, e.target.value);
                      }}
                      className={`block w-full p-2.5 text-sm rounded-lg focus:ring-2 ${
                        service.status === "active"
                          ? "bg-green-100 text-green-800 border-green-300 focus:ring-green-500 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600"
                          : service.status === "draft"
                          ? "bg-red-100 text-red-800 border-red-300 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600"
                          : "bg-blue-100 text-blue-800 border-blue-300 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                      }`}
                    >
                      {["active", "draft"].map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="bg-white text-gray-800"
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => openDetailsModal(service)}
                      className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      title="View Details"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditorModal(service)}
                      className="p-2 rounded-md bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-all duration-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                      title="Edit Service"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </button>
                    {console.log(AuthUser?.role?.name)}
                    <button
                      type="button"
                      onClick={() => openDeleteModal(service)}
                      disabled={AuthUser?.role?.name !== "Admin"}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        AuthUser?.role?.name === "Admin"
                          ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      }`}
                      title={
                        AuthUser?.role?.name === "Admin"
                          ? "Delete Service"
                          : "Admin Only"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {isEditorOpen && (
              <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 overflow-y-auto">
                {" "}
                <ServiceFieldEditor
                  service={serviceToEdit}
                  onClose={closeEditorModal}
                  onSave={handleServiceSave}
                />
              </div>
            )}
            {services.length === 0 && (
              <tr className="bg-white dark:bg-gray-800">
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mb-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      No services found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {statusFilter !== "all"
                        ? `No ${statusFilter} services found. Try changing the filter.`
                        : "Start by adding your first service."}
                    </p>
                    {statusFilter === "all" && (
                      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Add New Service
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-10 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full shadow-xl overflow-hidden">
            <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Service Details
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
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
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-6">
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      Service Name
                    </h4>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {selectedService.name}
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      Price
                    </h4>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(selectedService.base_price || 0)}
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      Category
                    </h4>
                    {console.log(selectedService)}
                    <p className="text-gray-900 dark:text-white">
                      {selectedService.category.name || "Not categorized"}
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      Status
                    </h4>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedService.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      {selectedService.status?.charAt(0).toUpperCase() +
                        selectedService.status?.slice(1) || "Unknown"}
                    </span>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      Created At
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(selectedService.created_at)}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="mb-6">
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      Description
                    </h4>
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">
                      {selectedService.description || "No description provided"}
                    </p>
                  </div>
                  {selectedService.image && (
                    <div className="mb-6">
                      <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                        Image
                      </h4>
                      <div className="mt-2 w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={selectedService.image}
                          alt={selectedService.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/400x200?text=No+Image";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                Edit Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesTable;
