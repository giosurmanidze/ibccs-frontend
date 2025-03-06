"use client";
import React, { useEffect, useState } from "react";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import Slider1ZoomOuter from "./sliders/Slider1ZoomOuter";
import { useContextElement } from "@/context/Context";
import { openCartModal } from "@/utlis/openCartModal";
import axiosInstance from "@/config/axios";
import { FileDown } from "lucide-react";

export default function DetailsOuterZoom({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/product-detail");
      setPageContent(JSON.parse(response.data?.dynamic_content));
    };
    getPageContent();
  }, []);

  const button1 = pageContent?.buttons?.[0] ?? null;
  const button2 = pageContent?.buttons?.[1] ?? null;
  const button3 = pageContent?.buttons?.[2] ?? null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (fileId, filename) => {
    const url = `http://localhost:8000/api/download/${fileId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section style={{ maxWidth: "100vw", overflow: "clip" }}>
      <div
        className="tf-main-product section-image-zoom"
        style={{ maxWidth: "100vw", overflow: "clip" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <div className="thumbs-slider">
                  <Slider1ZoomOuter firstImage={product?.icon} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-title">
                    <h6>{product?.name}</h6>
                  </div>
                  <div className="tf-product-info-price">
                    <div className="price-on-sale">${product?.base_price}</div>
                    <div
                      className="badges-on-sale"
                      style={{
                        color: button3?.text_color,
                        backgroundColor: button3?.background_color,
                      }}
                    >
                      <span>20</span>% OFF
                    </div>
                  </div>
                  <div className="tf-product-info-quantity">
                    <div className="quantity-title fw-6">Quantity</div>
                    <Quantity setQuantity={setQuantity} button2={button2} />
                  </div>
                  <div
                    clasGuarantee
                    Safe
                    CheckoutsName="product-description-container my-5"
                  >
                    <h5 className="text-lg font-semibold mb-2 text-gray-800">
                      Service Details
                    </h5>
                    <div className="description-content">
                      {product?.description && (
                        <p className="text-gray-700 leading-relaxed">
                          <span className="float-left text-3xl font-serif mr-2 mt-1 text-gray-900">
                            {product.description.charAt(0)}
                          </span>
                          {product.description.substring(1)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Files Section */}
                  {product?.files && product.files.length > 0 && (
                    <div className="files-section mt-4 mb-4">
                      <h5 className="text-lg font-semibold mb-2 text-gray-800">
                        Attached Files
                      </h5>
                      <div className="files-list space-y-2">
                        {product.files.map((file) => (
                          <div
                            key={file.id}
                            className="file-item mt-2 flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="file-info flex items-center space-x-3">
                              <FileDown className="text-gray-600" size={24} />
                              <div>
                                <p className="font-medium text-gray-800">
                                  {file.file_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(file.file_size_bytes)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleDownload(file.id, file.filename)
                              }
                              rel="noopener noreferrer"
                              download
                              className="download-btn bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="tf-product-info-buy-button">
                    <form onSubmit={(e) => e.preventDefault()} className="">
                      <a
                        onClick={() => {
                          openCartModal();
                          addProductToCart(
                            product?.id,
                            quantity ? quantity : 1
                          );
                        }}
                        className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
                        style={{
                          color: button1?.text_color,
                          backgroundColor: button1?.background_color,
                        }}
                      >
                        <span>
                          {isAddedToCartProducts(product?.id)
                            ? "Already Added"
                            : "Add to cart"}
                        </span>
                        <span
                          className="tf-qty-price"
                          style={{ marginLeft: "10px" }}
                        >
                          ${(product?.base_price * quantity).toFixed(2)}
                        </span>
                      </a>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      <StickyItem />
    </section>
  );
}
