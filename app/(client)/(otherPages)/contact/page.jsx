"use client";
import ContactForm from "@/components/othersPages/contact/ContactForm";
import Map from "@/components/othersPages/contact/Map";
import axiosInstance from "@/config/axios";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      try {
        const response = await axiosInstance.get(`pages/contact`);
        const content = JSON.parse(response.data?.dynamic_content || "{}");

        if (Array.isArray(content.dynamic_fields)) {
          content.dynamic_fields = {};
        }

        setPageContent(content);
      } catch (error) {
        console.error("Error fetching contact page data:", error);
      }
    };

    getPageContent();
  }, []);

  return (
    <>
      <Map pageContent={pageContent?.contact_details} />
      <ContactForm dynamicFields={pageContent?.dynamic_fields || {}} />
    </>
  );
}
