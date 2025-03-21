"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

export default function Footer({ pageContent, headerLogo }) {
  useEffect(() => {
    const handleFooterAccordion = () => {
      const accordionToggles = document.querySelectorAll(
        ".footer-accordion-toggle"
      );

      accordionToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
          const content = toggle.nextElementSibling;

          toggle.classList.toggle("active");

          if (content.style.maxHeight) {
            content.style.maxHeight = null;
          } else {
            content.style.maxHeight = content.scrollHeight + "px";
          }
        });
      });
    };
    if (window.innerWidth < 768) {
      handleFooterAccordion();
    }

    const handleResize = () => {
      const accordionContents = document.querySelectorAll(
        ".footer-accordion-content"
      );

      if (window.innerWidth >= 768) {
        accordionContents.forEach((content) => {
          content.style.maxHeight = null;
        });
      } else {
        handleFooterAccordion();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      const accordionToggles = document.querySelectorAll(
        ".footer-accordion-toggle"
      );
      accordionToggles.forEach((toggle) => {
        toggle.removeEventListener("click", () => {});
      });
    };
  }, []);

  const background_color = pageContent?.background_color?.value;
  const texts_color = pageContent?.texts_color?.value;
  const address = pageContent?.address?.value;
  const phone_number = pageContent?.phone_number?.value;
  const email = pageContent?.email?.value;
  const copyright_text = pageContent?.copyright_text?.value;
  const footer_quick_links = pageContent?.footer_quick_links;
  const footer_social_links = pageContent?.footer_social_links;
  const footer_qr_image = pageContent?.footer_qr_image;
  const footer_qr_title = pageContent?.footer_qr_title;

  return (
    <footer
      className=" !text-gray-800 !py-6 !lg:py-10 mt-10!"
      style={{ backgroundColor: background_color }}
    >
      <div
        className="!container !mx-auto !px-4 !sm:px-6 !lg:px-8"
        style={{ color: texts_color }}
      >
        <img
          className="!h-7 !md:h-8"
          src={headerLogo?.value || "/logo.png"}
          alt="Fashion Shop Logo"
        />
<div className="!flex !flex-col max-lg:!flex-wrap lg:!flex-row !space-y-6 lg:!space-y-0 lg:!space-x-6 xl:!space-x-8 mt-10!">
          <div className="!w-full lg:!w-[calc(100%_-_350px)] xl:!w-[calc(100%_-_650px)] !flex !flex-col lg:!flex-row !space-y-6 lg:!space-y-0 lg:!space-x-24">
            {/* Contact Us Section */}
            <div className="!w-full lg:!w-auto">
              <div className="!space-y-2 !md:space-y-3 !mt-2">
                <h3
                  className="!text-base !md:text-lg !font-bold !mb-3 !flex !items-center !justify-between footer-accordion-toggle"
                  style={{ color: texts_color }}
                >
                  Contact Us
                </h3>
                <div className="!flex !items-center !space-x-3 !text-xs !md:text-sm">
                  <MapPin
                    className="!flex-shrink-0 !h-4 !w-4"
                    style={{ color: texts_color }}
                  />
                  <p style={{ color: texts_color }}>{address}</p>
                </div>
                <div className="!flex !items-center !space-x-3 !text-xs !md:text-sm">
                  <Mail
                    className="!flex-shrink-0 !h-4 !w-4"
                    style={{ color: texts_color }}
                  />
                  <a
                    href="mailto:info@fashionshop.com"
                    style={{ color: texts_color }}
                  >
                    {email}
                  </a>
                </div>
                <div className="!flex !items-center !space-x-3 !text-xs !md:text-sm">
                  <Phone
                    className="!flex-shrink-0 !h-4 !w-4"
                    style={{ color: texts_color }}
                  />
                  <a href="tel:+12125551234" style={{ color: texts_color }}>
                    {phone_number}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="!w-full lg:!w-auto">
              <h3
                className="!text-base !md:text-lg !font-bold !mb-3 !flex !items-center !justify-between footer-accordion-toggle"
                style={{ color: texts_color }}
              >
                Quick Links
              </h3>
              <div className="footer-accordion-content !overflow-hidden !transition-all !duration-300 !space-y-2">
                <ul className="!space-y-1 !md:space-y-2">
                  {(footer_quick_links || []).map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.url}
                        className="!text-xs !md:text-sm hover:opacity-80 !transition-colors !duration-200 !inline-block"
                        style={{ color: texts_color }}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="!w-full lg:!w-auto !space-y-2 !md:space-y-3 flex flex-col items-center">
              <h3
                className="!text-base !md:text-lg !font-bold !mb-3 !text-center"
                style={{ color: texts_color }}
              >
                {footer_qr_title?.value || "Scan Our QR Code"}
              </h3>
              <div className="!flex !flex-col !items-center">
                {footer_qr_image?.value && (
                  <div className="!bg-white !p-2 !rounded-lg !mb-2 !shadow-sm !w-28 !h-28 !flex !items-center !justify-center">
                    <img
                      src={footer_qr_image.value}
                      alt="QR Code"
                      className="!max-w-full !max-h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Locations Section */}
          <div className="!w-full lg:!w-[350px] xl:!w-[650px]">
            <h3
              className="!text-base !md:text-lg !font-bold !mb-3 flex items-center justify-between footer-accordion-toggle"
              style={{ color: texts_color }}
            >
              Our Locations
            </h3>
            <div className="footer-accordion-content !overflow-hidden !transition-all !duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 !gap-3">
                <div className="!bg-white !rounded-lg !overflow-hidden !shadow-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.482190386937!2d44.7736806!3d41.7101128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x404473952e9571cb%3A0x1631de42d4e2bc0c!2sIBCCS%20GEORGIA%20Tbilisi!5e0!3m2!1sen!2sge!4v1739518846855!5m2!1sen!2sge"
                    width="100%"
                    height="140"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="!hover:opacity-90 !transition-opacity"
                  ></iframe>
                  <div
                    className="!p-1 !text-center !bg-gray-100 !font-medium !text-xs"
                    style={{ color: "#333" }}
                  >
                    Georgia, Tbilisi
                  </div>
                </div>
                <div className="!bg-white !rounded-lg !overflow-hidden !shadow-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2981.7650713671337!2d41.617024!3d41.639209199999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x406787fa943e18cd%3A0x105adfdfaf372335!2sIBCCS%20GEORGIA%20Batumi!5e0!3m2!1sen!2sge!4v1739518954554!5m2!1sen!2sge"
                    width="100%"
                    height="140"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="!hover:opacity-90 !transition-opacity"
                  ></iframe>
                  <div
                    className="!p-1 !text-center !bg-gray-100 !font-medium !text-xs"
                    style={{ color: "#333" }}
                  >
                    Georgia, Batumi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="!mt-6 !md:mt-8 !pt-4 !border-t !border-gray-300 !flex !justify-between !items-center">
          <div className="!text-xs" style={{ color: texts_color }}>
            {copyright_text}
          </div>
          <div className="!flex !space-x-4 !mt-3 !md:mt-0">
            {(footer_social_links || []).map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="!hover:opacity-80 !transition-colors"
                aria-label={link.name}
                style={{ color: texts_color }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name === "Twitter" && <Twitter className="!h-4 !w-4" />}
                {link.name === "Facebook" && <Facebook className="!h-4 !w-4" />}
                {link.name === "Instagram" && (
                  <Instagram className="!h-4 !w-4" />
                )}
                {link.name === "LinkedIn" && <Linkedin className="!h-4 !w-4" />}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
