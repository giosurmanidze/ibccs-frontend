"use client";
import React, { useEffect, useRef, useState } from "react";
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
];

export default function Footer({ pageContent, headerLogo }) {
  useEffect(() => {
    const headings = document.querySelectorAll(".footer-heading-mobile");

    const toggleOpen = (event) => {
      const parent = event.target.closest(".footer-col-block");
      parent.classList.toggle("open");
    };

    headings.forEach((heading) => {
      heading.addEventListener("click", toggleOpen);
    });

    return () => {
      headings.forEach((heading) => {
        heading.removeEventListener("click", toggleOpen);
      });
    };
  }, []);

  const background_color = pageContent?.background_color?.value || "#ffffff";
  const footer_texts_color = pageContent?.texts_color?.value || "#ffffff";

  console.log(pageContent);

  return (
    <footer className="bg-white text-gray-800 !py-12">
      <div className="container mx-auto !px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <img
              className="!text-2xl font-bold !mb-4 text-black"
              src={headerLogo?.value}
              alt=""
            />
            <div className="!space-y-4">
              <div className="flex items-center !space-x-3">
                <MapPin className=" text-black" />
                <p>1234 Fashion Street, Suite 567, New York, NY 10001</p>
              </div>
              <div className="flex items-center !space-x-3">
                <Mail className=" text-black" />
                <a
                  href="mailto:info@fashionshop.com"
                  className="hover:text-blue-300  text-black"
                >
                  info@fashionshop.com
                </a>
              </div>
              <div className="flex items-center !space-x-3">
                <Phone className=" text-black" />
                <a
                  href="tel:+12125551234"
                  className="hover:text-blue-300  text-black"
                >
                  (212) 555-1234
                </a>
              </div>
            </div>
          </div>

          <div className="!space-y-6">
            <h3 className="!text-2xl font-bold !mb-4">Quick Links</h3>
            <ul className="!space-y-3">
              {aboutLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-300 transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="!space-y-6">
            <h3 className="!text-2xl font-bold !mb-4">Our Locations</h3>
            <div className="grid !grid-cols-2 !gap-4">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.482190386937!2d44.7736806!3d41.7101128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x404473952e9571cb%3A0x1631de42d4e2bc0c!2sIBCCS%20GEORGIA%20Tbilisi!5e0!3m2!1sen!2sge!4v1739518846855!5m2!1sen!2sge"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="hover:scale-105 transition-transform"
                ></iframe>
                <div className="!p-2 text-center text-white">
                  Gerogia,Tbilisi
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2981.7650713671337!2d41.617024!3d41.639209199999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x406787fa943e18cd%3A0x105adfdfaf372335!2sIBCCS%20GEORGIA%20Batumi!5e0!3m2!1sen!2sge!4v1739518954554!5m2!1sen!2sge"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="hover:scale-105 transition-transform"
                ></iframe>
                <div className="!p-2 text-center text-white">Gerogia,Batumi</div>
              </div>
            </div>
          </div>
        </div>
        <div className="!mt-12 border-t border-gray-700 !pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm">
            © {new Date().getFullYear()} Fashion Shop. All Rights Reserved
          </div>
          <div className="flex !space-x-4 mt-4 !md:mt-0">
            <a href="#">
              <Twitter />
            </a>
            <a href="#">
              <Facebook />
            </a>
            <a href="#">
              <Instagram />
            </a>
            <a href="#">
              <Linkedin />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
