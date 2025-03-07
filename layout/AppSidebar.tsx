"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
  UserCircleIcon,
  MessageIcon,
  FilesIcon,
  OrderIcon,
} from "../icons/index";
import { useUnreadMessages } from "@/context/UnreadMessagesContext";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const { unreadCount, fetchUnreadMessages } = useUnreadMessages();

  useEffect(() => {
    fetchUnreadMessages();
  }, [fetchUnreadMessages]);

  const navItems = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      subItems: [{ name: "dashboard", path: "/dashboard", pro: false }],
    },
    {
      name: "Users",
      icon: <UserCircleIcon />,
      subItems: [
        { name: "User create", path: "/user-create", pro: false },
        { name: "List", path: "/users-list", pro: false },
      ],
    },
    {
      name: "Orders",
      icon: <OrderIcon />,
      subItems: [{ name: "List", path: "/orders-list", pro: false }],
    },
    {
      name: "Pages",
      icon: <PageIcon />,
      subItems: [
        { name: "Create page", path: "/pages/create", pro: false },
        { name: "List Pages", path: "/pages/list", pro: false },
        {
          name: "Edit Layouts",
          path: "",
          pro: false,
          childItems: [
            { name: "Header", path: "/pages/layouts/header", pro: false },
            { name: "Footer", path: "/pages/layouts/footer", pro: false },
            { name: "Sidebar", path: "/pages/layouts/sidebar", pro: false },
          ],
        },
      ],
    },
    {
      icon: <MessageIcon />,
      name: "Messages from contact",
      unreadCount: unreadCount,
      subItems: [{ name: "Messages", path: "/messages", pro: false }],
    },
    {
      icon: <FilesIcon />,
      name: "Files",
      unreadCount: unreadCount,
      subItems: [{ name: "Files and images", path: "/medias", pro: false }],
    },
    {
      icon: <FilesIcon />,
      name: "Services",
      unreadCount: unreadCount,
      subItems: [
        { name: "services configuration", path: "/services", pro: false },
      ],
    },
    {
      icon: <GridIcon />,
      name: "Categories",
      unreadCount: unreadCount,
      subItems: [{ name: "List categories", path: "/categories", pro: false }],
    },
  ];

  const renderMenuItems = (navItems, menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group relative ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}

              {nav.unreadCount > 0 && (
                <span
                  className={`absolute ${
                    isExpanded || isHovered || isMobileOpen
                      ? "right-9"
                      : "top-0 right-0"
                  } flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full`}
                >
                  {nav.unreadCount}
                </span>
              )}

              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group relative ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}

                {nav.unreadCount > 0 && (
                  <span
                    className={`absolute ${
                      isExpanded || isHovered || isMobileOpen
                        ? "right-2"
                        : "top-0 right-0"
                    } flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full`}
                  >
                    {nav.unreadCount}
                  </span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    {subItem.childItems ? (
                      <div>
                        <Link
                          href={subItem.path}
                          className={`menu-dropdown-item flex items-center justify-between ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          <span>{subItem.name}</span>
                          <ChevronDownIcon
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isActive(pathname) &&
                              pathname.startsWith(subItem.path)
                                ? "rotate-180 text-brand-500"
                                : ""
                            }`}
                          />
                        </Link>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isActive(pathname) &&
                            pathname.startsWith(subItem.path)
                              ? "max-h-40"
                              : "max-h-0"
                          }`}
                        >
                          <ul className="pl-4 mt-1 space-y-1">
                            {subItem.childItems.map((childItem) => (
                              <li key={childItem.name}>
                                <Link
                                  href={childItem.path}
                                  className={`menu-dropdown-item text-sm ${
                                    isActive(childItem.path)
                                      ? "menu-dropdown-item-active"
                                      : "menu-dropdown-item-inactive"
                                  }`}
                                >
                                  {childItem.name}
                                  <span className="flex items-center gap-1 ml-auto">
                                    {childItem.new && (
                                      <span className="menu-dropdown-badge">
                                        new
                                      </span>
                                    )}
                                    {childItem.pro && (
                                      <span className="menu-dropdown-badge">
                                        pro
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item relative ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span className="menu-dropdown-badge">new</span>
                          )}
                          {subItem.pro && (
                            <span className="menu-dropdown-badge">pro</span>
                          )}
                          {subItem.unreadCount > 0 && (
                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                              {subItem.unreadCount}
                            </span>
                          )}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      ></div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
