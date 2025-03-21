"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductGrid from "./ProductGrid";
import SearchBar from "./SearchBar";
import axiosInstance from "@/config/axios";
import { X } from "lucide-react";

function ShopDefaultContent() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId") || "";
  const categoryName = searchParams.get("categoryName");
  const urlSearchQuery = searchParams.get("search");

  useEffect(() => {
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  const fetchServices = async () => {
    setIsLoading(true);

    try {
      let endpoint = "/services";
      let params = { sort: "default" };

      if (categoryId) {
        params.categoryId = categoryId;
      }

      if (searchQuery) {
        endpoint = "/services/search";
        params.query = searchQuery;
      }

      console.log("endpoint", endpoint);

      const response = await axiosInstance.get(
        `services/search?categoryId=${categoryId}`,
        { params }
      );

      if (response.data && response.data.services) {
        setServices(response.data.services);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [categoryId, searchQuery]);

  const handleSearchResults = (query, results) => {
    setSearchQuery(query);

    if (results) {
      setServices(results);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");

    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    router.push(`/shop?${newParams.toString()}`);
  };

  return (
    <>
      <section className="flat-spacing-2">
        <div className="container">
          <div className="search-container mb-4">
            <SearchBar
              initialQuery={searchQuery}
              onSearch={handleSearchResults}
            />
            {searchQuery && (
              <div className="bg-gray-50 rounded-md !p-3 shadow-sm border border-gray-200 flex items-center justify-between !mb-4">
                <p className="text-gray-700 !text-sm font-medium">
                  Found{" "}
                  <span className="font-bold text-blue-600">
                    {services.length}
                  </span>{" "}
                  results
                  {searchQuery && (
                    <span>
                      for
                      <span className="italic text-gray-800">
                        {searchQuery}
                      </span>
                    </span>
                  )}
                </p>
                <button
                  className="!ml-2 !px-3 !py-1 !text-xs bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center"
                  onClick={clearSearch}
                >
                  <X size={14} className="!mr-1" /> Clear Search
                </button>
              </div>
            )}
          </div>
          {!searchQuery && categoryName && (
            <div className="category-header mb-4">
              <div className="row">
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <h2 className="category-title fs-3 fw-bold mb-0">
                      {categoryName}
                    </h2>
                    <span className="badge bg-secondary ms-3 rounded-pill">
                      {services.length || 0} services
                    </span>
                  </div>
                </div>
              </div>
              <hr className="my-3" />
            </div>
          )}
          <div className="wrapper-control-shop">
            <div className="meta-filter-shop" />
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <ProductGrid allproducts={services} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function ShopDefault() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopDefaultContent />
    </Suspense>
  );
}
