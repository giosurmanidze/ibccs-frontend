"use client";

import { useEffect, useState } from "react";
import "@/public/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import "@/public/css/tail.css";
import Context from "@/context/Context";
import ProductSidebar from "@/components/modals/ProductSidebar";
import ShopCart from "@/components/modals/ShopCart";
import AskQuestion from "@/components/modals/AskQuestion";
import DeliveryReturn from "@/components/modals/DeliveryReturn";
import FindSize from "@/components/modals/FindSize";
import Login from "@/components/modals/Login";
import MobileMenu from "@/components/modals/MobileMenu";
import Register from "@/components/modals/Register";
import ResetPass from "@/components/modals/ResetPass";
import ToolbarBottom from "@/components/modals/ToolbarBottom";
import ToolbarShop from "@/components/modals/ToolbarShop";
import { usePathname } from "next/navigation";
import ShareModal from "@/components/modals/ShareModal";
import ScrollTop from "@/components/common/ScrollTop";
import RtlToggle from "@/components/common/RtlToggle";
import Header22 from "@/components/headers/Header22";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Footer2 from "@/components/footers/Footer2";
import { AuthProvider } from "@/context/AuthContext";
import axiosInstance from "@/config/axios";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.esm").then(() => {});
    }
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (window.scrollY > 100) {
        header.classList.add("header-bg");
      } else {
        header.classList.remove("header-bg");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [scrollDirection, setScrollDirection] = useState("down");

  useEffect(() => {
    setScrollDirection("up");
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 250) {
        if (currentScrollY > lastScrollY.current) {
          setScrollDirection("down");
        } else {
          setScrollDirection("up");
        }
      } else {
        setScrollDirection("down");
      }

      lastScrollY.current = currentScrollY;
    };

    const lastScrollY = { current: window.scrollY };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);
  useEffect(() => {
    const bootstrap = require("bootstrap");
    const modalElements = document.querySelectorAll(".modal.show");
    modalElements.forEach((modal) => {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    });

    const offcanvasElements = document.querySelectorAll(".offcanvas.show");
    offcanvasElements.forEach((offcanvas) => {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    });
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      if (scrollDirection == "up") {
        header.style.top = "0px";
      } else {
        header.style.top = "-185px";
      }
    }
  }, [scrollDirection]);
  useEffect(() => {
    const WOW = require("@/utlis/wow");
    const wow = new WOW.default({
      mobile: false,
      live: false,
    });
    wow.init();
  }, [pathname]);

  useEffect(() => {
    const initializeDirection = () => {
      const direction = localStorage.getItem("direction");

      if (direction) {
        const parsedDirection = JSON.parse(direction);
        document.documentElement.dir = parsedDirection.dir;
        document.body.classList.add(parsedDirection.dir);
      } else {
        document.documentElement.dir = "ltr";
      }

      const preloader = document.getElementById("preloader");
      if (preloader) {
        preloader.classList.add("disabled");
      }
    };

    initializeDirection();
  }, []);

  const queryClient = new QueryClient();

  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/header");
      setPageContent(JSON.parse(response.data?.dynamic_content));
      console.log(
        "JSON.parse(response.data?.dynamic_content)",
        JSON.parse(response.data?.dynamic_content)
      );
    };
    getPageContent();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <body className="preload-wrapper">
          <div className="preload preload-container" id="preloader">
            <div className="preload-logo">
              <div className="spinner"></div>
            </div>
          </div>{" "}
          <Context>
            <AuthProvider>
              <Header22 pageContent={pageContent} />
              <div id="wrapper">{children}</div>
              <RtlToggle />
              <ProductSidebar />
              <ShopCart pageContent={pageContent?.sidebar_buttons} />
              <AskQuestion />
              <DeliveryReturn />
              <FindSize />
              <Login />
              <MobileMenu />
              <Register />
              <ResetPass />
              <ToolbarBottom />
              <ToolbarShop />
              <ShareModal />
            </AuthProvider>
          </Context>
          <ScrollTop />
          <Footer2
            pageContent={pageContent?.footer}
            headerLogo={pageContent.header?.header_logo}
          />
        </body>
      </html>
    </QueryClientProvider>
  );
}
