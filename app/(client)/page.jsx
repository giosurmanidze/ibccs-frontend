"use client";
import Collections from "@/components/homes/home-gaming-accessories/Collections";
import Hero from "@/components/homes/home-gaming-accessories/Hero";
import axiosInstance from "@/config/axios";
import React, { useEffect, useState } from "react";

export default function Page() {
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
      <div >
        <Hero pageContent={pageContent} />
        <Collections />
      </div>
    </>
  );
}
