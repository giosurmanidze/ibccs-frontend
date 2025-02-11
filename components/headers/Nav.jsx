"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function Nav({ isArrow = true, textColor = "", Linkfs = "" }) {
  const pathname = usePathname();

  const isMenuActive = (menuItem) => {
    let active = false;

    // Check if the pathname matches the menu item's href
    if (typeof menuItem === "string" && pathname === menuItem) {
      active = true;
    }

    // Check for matching sub-menu links
    if (Array.isArray(menuItem)) {
      menuItem.forEach((item) => {
        if (item.href && pathname === item.href) {
          active = true;
        }
        // Check nested links
        if (item.links) {
          item.links.forEach((elm2) => {
            if (elm2.href && pathname === elm2.href) {
              active = true;
            }
            if (elm2.links) {
              elm2.links.forEach((elm3) => {
                if (elm3.href && pathname === elm3.href) {
                  active = true;
                }
              });
            }
          });
        }
      });
    }

    return active;
  };

  return (
    <>
      <li className="menu-item">
        <a
          href="/about-us"
          className={`item-link ${Linkfs} ${textColor} ${
            pathname === "/about-us" ? "activeMenu" : ""
          }`}
        >
          About us
        </a>
      </li>
      <li className="menu-item">
        <a
          href="/contact"
          className={`item-link ${Linkfs} ${textColor} ${
            pathname === "/contact" ? "activeMenu" : ""
          }`}
        >
          Contact
        </a>
      </li>
    </>
  );
}
