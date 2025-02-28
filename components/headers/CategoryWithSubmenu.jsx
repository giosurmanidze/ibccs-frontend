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
    <li className="nav-mb-item" ref={subMenuRef}>
      <a
        href={`#${uniqueId}`}
        className={`tf-category-link has-children ${
          !subMenuOpen ? "collapsed" : ""
        } mb-menu-link`}
        onClick={handleSubMenuClick}
      >
        <div>
          <Image
            alt="img"
            src={`http://localhost:8000/storage/${d.icon}`}
            width={30}
            height={38}
          />
        </div>
        <span className="link">
          {d.name.length > 25 ? `${d.name.substring(0, 20)}...` : d.name}
        </span>
        <span className="btn-open-sub" />
      </a>
      <div
        id={uniqueId}
        className={`${subMenuOpen ? "show" : "collapse"} list-cate-below`}
        style={{ display: subMenuOpen ? "block" : "none" }}
      >
        <ul
          className="sub-nav-menu"
          id={`cate-menu-navigation-${d.id || d.name}`}
        >
          {Array.isArray(d?.services) &&
            d?.services.map((s, key) => (
              <li key={s.id || key}>
                <Link
                  href={`/product-detail/${s.id}?categoryId=${s.category_id}`}
                  className="tf-category-link sub-nav-link"
                >
                  <div>
                    <Image
                      alt="img"
                      src={`http://localhost:8000/storage/${s.icon}`}
                      width={30}
                      height={38}
                    />
                  </div>
                  <span>
                    {s.name.length > 25
                      ? `${s.name.substring(0, 20)}...`
                      : s.name}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </li>
  );
};
