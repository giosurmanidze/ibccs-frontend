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

export const aboutLinks = [
  { href: "/contact", text: "Contact Us" },
  { href: "/about-us", text: "About Us" },
  { href: "/faq", text: "FAQ" },
  { href: "/shipping", text: "Shipping & Returns" },
  { href: "/privacy-policy", text: "Privacy Policy" },
];

export default function Footer({ pageContent, headerLogo }) {
  useEffect(() => {
    const handleFooterAccordion = () => {
      const accordionToggles = document.querySelectorAll(
        ".footer-accordion-toggle"
      );

      accordionToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
          const content = toggle.nextElementSibling;

          // Toggle active class
          toggle.classList.toggle("active");

          // Toggle content visibility
          if (content.style.maxHeight) {
            content.style.maxHeight = null;
          } else {
            content.style.maxHeight = content.scrollHeight + "px";
          }
        });
      });
    };

    // Initialize accordions only on mobile
    if (window.innerWidth < 768) {
      handleFooterAccordion();
    }

    // Update on resize
    const handleResize = () => {
      const accordionContents = document.querySelectorAll(
        ".footer-accordion-content"
      );

      if (window.innerWidth >= 768) {
        // Reset all accordions on desktop
        accordionContents.forEach((content) => {
          content.style.maxHeight = null;
        });
      } else {
        // Re-initialize on mobile
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

  return (
    <footer className="!bg-gray-200 !text-gray-800 !py-6 !lg:py-10">
      <div className="!container !mx-auto !px-4 !sm:px-6 !lg:px-8">
        <div className="!grid md:grid-cols-2 lg:grid-cols-3 !gap-6 !lg:gap-8">
          {/* Company info section */}
          <div className="!space-y-3 !md:space-y-4">
            <div className="!flex !items-center">
              <img
                className="!h-7 !md:h-8"
                src={headerLogo?.value || "/logo.png"}
                alt="Fashion Shop Logo"
              />
            </div>

            <p className="!text-xs !md:text-sm !text-gray-600 !max-w-md">
              Your go-to destination for the latest fashion trends, premium
              quality clothing, and accessories.
            </p>

            <div className="!space-y-2 !md:space-y-3 !mt-2">
              <div className="!flex !items-center !space-x-3 !text-xs !md:text-sm">
                <MapPin className="!text-gray-500 !flex-shrink-0 !h-4 !w-4" />
                <p className="!text-gray-700">
                  1234 Fashion Street, Suite 567, New York, NY 10001
                </p>
              </div>
              <div className="!flex !items-center !space-x-3 !text-xs !md:text-sm">
                <Mail className="!text-gray-500 !flex-shrink-0 !h-4 !w-4" />
                <a
                  href="mailto:info@fashionshop.com"
                  className="!text-gray-700 hover:text-blue-600 !transition-colors !duration-200"
                >
                  info@fashionshop.com
                </a>
              </div>
              <div className="!flex !items-center !space-x-3 !text-xs !md:text-sm">
                <Phone className="!text-gray-500 !flex-shrink-0 !h-4 !w-4" />
                <a
                  href="tel:+12125551234"
                  className="!text-gray-700 hover:text-blue-600 !transition-colors !duration-200"
                >
                  (212) 555-1234
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links section */}
          <div className="!md:px-4">
            <h3 className="!text-base !md:text-lg !font-bold !mb-3 !flex !items-center !justify-between footer-accordion-toggle">
              Quick Links
            </h3>
            <div className="footer-accordion-content !overflow-hidden !transition-all !duration-300 !space-y-2">
              <ul className="!space-y-1 !md:space-y-2">
                {aboutLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="!text-xs !md:text-sm !text-gray-700 hover:text-blue-600 !transition-colors !duration-200 !inline-block"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Our Locations section */}
          <div>
            <h3 className="!text-base !md:text-lg !font-bold !mb-3 flex items-center justify-between footer-accordion-toggle">
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
                  <div className="!p-1 !text-center !text-gray-800 !bg-gray-100 !font-medium !text-xs">
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
                  <div className="!p-1 !text-center !text-gray-800 !bg-gray-100 !font-medium !text-xs">
                    Georgia, Batumi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer with copyright and social */}
        <div className="!mt-6 !md:mt-8 !pt-4  !border-t !border-gray-300 !flex !flex-col !md:flex-row !justify-between !items-center">
          <div className="!text-xs !text-gray-600">
            © {new Date().getFullYear()} Fashion Shop. All Rights Reserved
          </div>
          <div className="!flex !space-x-4 !mt-3 !md:mt-0">
            <a
              href="#"
              className="!text-gray-500 hover:text-blue-600 !transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="!h-4 !w-4" />
            </a>
            <a
              href="#"
              className="!text-gray-500 hover:text-blue-600 !transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="!h-4 !w-4" />
            </a>
            <a
              href="#"
              className="!text-gray-500 hover:text-blue-600 !transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="!h-4 !w-4" />
            </a>
            <a
              href="#"
              className="!text-gray-500 hover:text-blue-600 !transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="!h-4 !w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
