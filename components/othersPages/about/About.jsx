import React from "react";
import Image from "next/image";

export default function About({ pageContent }) {
  const cards = pageContent?.cards || [];
  return (
    <>
      {cards.map((card, index) => (
        <section
          key={index}
          className={`flat-spacing-${
            index % 2 === 0 ? "23" : "15"
          } flat-image-text-section`}
        >
          <div className="container">
            <div className="tf-grid-layout md-col-2 tf-img-with-text style-4">
              {index % 2 === 0 ? (
                <>
                  <div className="tf-image-wrap">
                    <Image
                      className="lazyload w-100"
                      src={card.image?.value || "/images/placeholder.jpg"}
                      alt={card.title?.value || "Card image"}
                      width={600}
                      height={499}
                    />
                  </div>
                  <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
                    <div>
                      <div className="heading">{card.title?.value || ""}</div>
                      <div className="text">
                        {card.description?.value || ""}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
                    <div>
                      <div className="heading">{card.title?.value || ""}</div>
                      <div className="text">
                        {card.description?.value || ""}
                      </div>
                    </div>
                  </div>{" "}
                  <div className="tf-image-wrap">
                    <Image
                      className="lazyload w-100"
                      src={card.image?.value || "/images/placeholder.jpg"}
                      alt={card.title?.value || "Card image"}
                      width={300}
                      height={499}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
