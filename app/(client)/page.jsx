"use client";
import Collections from "@/components/homes/home-gaming-accessories/Collections";
import Hero from "@/components/homes/home-gaming-accessories/Hero";
import Lookbook from "@/components/homes/home-gaming-accessories/Lookbook";
import Products2 from "@/components/homes/home-gaming-accessories/Products2";
import Store from "@/components/homes/home-gaming-accessories/Store";
import axiosInstance from "@/config/axios";
import React, { useEffect, useState } from "react";

export default function page() {
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/home");
      setPageContent(JSON.parse(response.data?.dynamic_content));
      console.log(response);
    };
    getPageContent();
  }, []);
  return (
    <>
      <div className="home-gaming-accessories color-primary-14">
        <Hero pageContent={pageContent} />
        <Collections />
        <Products2 />
        <Lookbook />
        <Store />
      </div>
    </>
  );
}
