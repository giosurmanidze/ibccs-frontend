"use client";
import About from "@/components/othersPages/about/About";
import FlatTitle from "@/components/othersPages/about/FlatTitle";
import axiosInstance from "@/config/axios";
import React, { useEffect, useState } from "react";

export default function page() {
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/about");
      setPageContent(JSON.parse(response.data?.dynamic_content));
    };
    getPageContent();
  }, []);

  return (
    <>
      <FlatTitle pageContent={pageContent} />
      <div className="container">
        <div className="line"></div>
      </div>
      <About pageContent={pageContent} />
      {/* <Features /> */}
      <div className="container">
        <div className="line"></div>
      </div>
    </>
  );
}
