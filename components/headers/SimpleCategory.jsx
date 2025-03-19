import Image from "next/image";
import Link from "next/link";

export const SimpleCategory = ({ category: d }) => {
  return (
    <li className="nav-mb-item">
      <Link
        href={`/shop-default?categoryId=${d.id}`}
        className="tf-category-link mb-menu-link"
      >
        <div className="flex-shrink-0">
          <Image alt="img" src={`${d?.icon}`} width={40} height={48} />
        </div>
        <span
          className="link"
          style={{
            wordBreak: "normal",
            wordWrap: "break-word",
            whiteSpace: "normal",
          }}
        >
          {d.name}
        </span>
      </Link>

      <style jsx>{`
        .link {
          overflow: visible;
          text-overflow: clip;
          max-width: none;
          width: auto;
          display: block;
        }
      `}</style>
    </li>
  );
};
