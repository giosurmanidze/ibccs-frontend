"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/config/axios";

export default function SearchBar({ initialQuery = "", onSearch }) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) {
      if (onSearch) {
        onSearch("", null);
      }
      return;
    }

    try {
      const response = await axiosInstance.get("/services/search", {
        params: {
          query: query,
        },
      });

      if (onSearch) {
        onSearch(query, response.data.services);
      } else {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("search", query);
        router.push(`/shop?${newParams.toString()}`);
      }
    } catch (error) {
      console.error("Search error:", error);
      if (onSearch) {
        onSearch(query, []);
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    performSearch(searchTerm);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="d-flex align-items-center">
        <input
          type="text"
          className="form-control"
          placeholder="Search by service name or category..."
          value={searchTerm}
          onChange={handleInputChange}
          aria-label="Search services"
        />
        <button type="submit" className="btn btn-primary ms-2">
          <span className="icon icon-search"></span>
        </button>
      </form>
    </div>
  );
}
