"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export const aboutLinks = [
  { href: "/contact", text: "Contact Us" },
  { href: "/about-us", text: "About Us" },
];

export default function Footer2({ pageContent }) {
  useEffect(() => {
    const headings = document.querySelectorAll(".footer-heading-moblie");

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

  const background_color = pageContent?.background_color["value"];
  const footer_texts_color = pageContent?.texts_color["value"];

  return (
    <footer
      id="footer"
      className="footer"
      style={{ backgroundColor: background_color }}
    >
      <div className="footer-wrap wow fadeIn" data-wow-delay="0s">
        <div className="footer-body">
          <div className="container">
            <div className="row">
              <div
                className="col-xl-3 col-md-6 col-12"
                style={{ color: footer_texts_color }}
              >
                <div className="footer-infor">
                  <ul>
                    <li>
                      <p>
                        Address: 1234 Fashion Street, Suite 567, <br />
                        New York, NY 10001
                      </p>
                    </li>
                    <li>
                      <p>
                        Email: <a href="#">info@fashionshop.com</a>
                      </p>
                    </li>
                    <li>
                      <p>
                        Phone: <a href="#">(212) 555-1234</a>
                      </p>
                    </li>
                  </ul>
                  <Link href={`/contact-1`} className="tf-btn btn-line">
                    Get direction
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                </div>
              </div>
              <div className="col-xl-3 col-md-6 col-12 footer-col-block">
                <div className="footer-heading footer-heading-desktop">
                  <h6 style={{ color: footer_texts_color }}>About us</h6>
                </div>
                <div className="footer-heading footer-heading-moblie">
                  <h6 style={{ color: footer_texts_color }}>About us</h6>
                </div>
                <ul className="footer-menu-list tf-collapse-content">
                  {aboutLinks.slice(0, 4).map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="footer-menu_item"
                        style={{ color: footer_texts_color }}
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="footer-bottom-wrap d-flex gap-20 flex-wrap justify-content-between align-items-center">
                  <div className="footer-menu_item">
                    © {new Date().getFullYear()} Ibccs. All Rights Reserved
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
