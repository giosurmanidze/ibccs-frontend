import Image from "next/image";
import Link from "next/link";

export const SimpleCategory = ({ category: d }) => {
  return (
    <li className="nav-mb-item">
      <Link
        href={`/shop-default?categoryId=${d.id}`}
        className="tf-category-link mb-menu-link"
      >
        <div>
          <Image
            alt="img"
            src={`http://localhost:8000/storage/${d.icon}`}
            width={40}
            height={48}
          />
        </div>
        <span className="link">
          {d.name.length > 50 ? `${d.name.substring(0, 50)}...` : d.name}
        </span>
      </Link>
    </li>
  );
};
