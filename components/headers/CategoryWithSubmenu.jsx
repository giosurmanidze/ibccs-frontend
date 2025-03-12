import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export const CategoryWithSubmenu = ({ category: d }) => {
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const uniqueId = `cate-menu-${d.id || d.name}`;
  const subMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target)) {
        setSubMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubMenuClick = (e) => {
    e.preventDefault();
    setSubMenuOpen(!subMenuOpen);
  };

  return (
    <li className="list-group-item p-0 mb-2 rounded shadow-sm" ref={subMenuRef}>
      <div className="d-flex align-items-center p-3 bg-light">
        <div className="d-flex align-items-center flex-grow-1">
          <Link
            href={`/shop-default?categoryId=${d.id}&categoryName=${d.name}`}
            style={{ textDecoration: "none" }}
          >
            <div className="d-inline-block">
              <div className="d-inline-flex align-items-center me-4">
                <div
                  className="rounded-circle bg-white p-1 d-flex justify-content-center align-items-center"
                  style={{ width: "40px", height: "40px" }}
                >
                  <Image
                    alt="category icon"
                    src={`${d?.icon}`}
                    width={24}
                    height={24}
                  />
                </div>
                <span className="ms-3 text-dark fw-medium">
                  {d.name.length > 25
                    ? `${d.name.substring(0, 20)}...`
                    : d.name}
                </span>
              </div>
            </div>
          </Link>
        </div>
        <a
          href={`#${uniqueId}`}
          className="d-flex align-items-center justify-content-center text-secondary"
          style={{ width: "30px", height: "30px" }}
          onClick={handleSubMenuClick}
        >
          <span className={`small ${subMenuOpen ? "rotate-180" : ""}`}>
            {subMenuOpen ? "▲" : "▼"}
          </span>
        </a>
      </div>

      <div
        id={uniqueId}
        className="bg-white"
        style={{ display: subMenuOpen ? "block" : "none" }}
      >
        <ul
          className="list-group list-group-flush py-2"
          id={`cate-menu-navigation-${d.id || d.name}`}
        >
          {Array.isArray(d?.services) &&
            d?.services.map((s, key) => (
              <li
                key={s.id || key}
                className="list-group-item border-0 py-1 px-0"
              >
                <Link
                  href={`/product-detail?serviceId=${s.id}&categoryId=${s.category_id}`}
                  className="d-flex align-items-center ps-4 px-3 py-2 text-decoration-none text-secondary"
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded bg-light me-3"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <Image
                      alt="service icon"
                      src={`${s?.icon}`}
                      width={20}
                      height={20}
                    />
                  </div>
                  <span className="small">
                    {s.name.length > 25
                      ? `${s.name.substring(0, 20)}...`
                      : s.name}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <style jsx>{`
        .rotate-180 {
          transform: rotate(180deg);
        }
      `}</style>
    </li>
  );
};
