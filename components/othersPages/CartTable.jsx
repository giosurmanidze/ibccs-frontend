import { Trash2, Loader2, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const CartTable = ({
  cartItems,
  removeItem,
  setQuantity,
  handleOpenModal,
  loadingItemId,
  tempCartChanges,
  savedData,
  getCleanFieldName,
  getProductTotal,
}) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Set initial state
      setIsMobile(window.innerWidth < 768);

      // Add resize event listener
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const toggleExpandItem = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  console.log(cartItems);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto rounded-lg shadow-lg border border-gray-200">
        <table className="min-w-full bg-white text-gray-800 table-fixed">
          <thead className="bg-[#000000] text-white uppercase text-sm">
            <tr>
              <th className="px-6 py-3 text-left service_header w-1/3">
                Service
              </th>
              <th className="px-6 py-3 text-center w-1/8">Price</th>
              <th className="px-6 py-3 text-center w-1/8">Quantity</th>
              <th className="px-6 py-3 text-center w-1/4">Total</th>
              <th className="px-6 py-3 text-center w-1/6">Details</th>
            </tr>
          </thead>
          <tbody>
            {cartItems?.map((elm, i) => {
              const serviceData = elm.service || elm;
              const category = elm.service?.category?.name;
              const serviceId = elm.service_id || elm.id;
              const categoryId = serviceData.category_id;
              const serviceName = serviceData.name || "Unknown Service";
              const serviceTitle = serviceData.title || serviceName;
              const serviceIcon = serviceData.icon || "/placeholder-image.jpg";
              const basePrice = parseFloat(serviceData.base_price || 0).toFixed(
                2
              );

              return (
                <tr
                  key={i}
                  className="border-b hover:bg-blue-50 transition group"
                  style={{ height: "auto", minHeight: "120px" }}
                >
                  <td className="px-6 py-4 flex items-center h-full space-x-4 table_tr relative align-middle">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Link
                      href={`/product-detail?serviceId=${serviceId}&categoryId=${categoryId}`}
                      className="flex-shrink-0"
                    >
                      <Image
                        alt="img-product"
                        src={serviceIcon}
                        width={50}
                        height={50}
                        className="rounded-md shadow-sm"
                      />
                    </Link>
                    <div className="flex flex-col service_name">
                      <Link
                        href={`/product-detail?serviceId=${serviceId}&categoryId=${categoryId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {serviceTitle}
                      </Link>
                      <p className="text-sm text-gray-500">{category}</p>
                      <button
                        className="text-orange-800 text-sm hover:underline mt-1 flex items-center"
                        onClick={() => removeItem(elm.id)}
                      >
                        <Trash2 size={16} />
                        <span className="remove_button">Remove</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold align-middle h-full">
                    {basePrice} euro
                  </td>
                  <td className="px-6 py-4 text-center align-middle h-full">
                    <div className="cart-quantity flex justify-center">
                      <div className="wg-quantity bg-gray-100 rounded-md px-1 py-1 inline-flex items-center">
                        <span
                          className="btn-quantity minus-btn w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setQuantity(elm.id, parseInt(elm.quantity - 1))
                          }
                          aria-label="Decrease quantity"
                        >
                          <svg
                            width={9}
                            height={1}
                            viewBox="0 0 9 1"
                            fill="currentColor"
                          >
                            <path d="M9 1H5.14286H3.85714H0V1.50201e-05H3.85714L5.14286 0L9 1.50201e-05V1Z" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="number"
                          value={elm.quantity}
                          min={1}
                          className="w-10 text-center border-0 bg-transparent"
                          onChange={(e) =>
                            setQuantity(elm.id, parseInt(e.target.value / 1))
                          }
                          aria-label="Quantity"
                        />
                        <span
                          className="btn-quantity plus-btn w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setQuantity(elm.id, parseInt(elm.quantity + 1))
                          }
                          aria-label="Increase quantity"
                        >
                          <svg
                            width={9}
                            height={9}
                            viewBox="0 0 9 9"
                            fill="currentColor"
                          >
                            <path d="M9 5.14286H5.14286V9H3.85714V5.14286H0V3.85714H3.85714V0H5.14286V3.85714H9V5.14286Z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center tf-cart-item_total align-middle h-full">
                    <div className="flex-grow overflow-y-auto flex flex-col">
                      <div className="extra-taxes-section flex-grow">
                        {((tempCartChanges && tempCartChanges[elm.id]) ||
                          elm.extraTaxFields) &&
                          Object.entries(
                            tempCartChanges?.[elm.id] || elm.extraTaxFields
                          )
                            .filter(
                              ([fieldName]) => fieldName !== "word_count_fee"
                            )
                            .map(([fieldName, field]) => (
                              <div
                                key={field?.name}
                                className="extra-tax-item text-xs flex justify-between items-center border-t border-gray-200 pt-1 mb-1"
                              >
                                <span
                                  className="text-gray-600 truncate max-w-[70%] group relative cursor-help"
                                  title={getCleanFieldName(fieldName)}
                                >
                                  {getCleanFieldName(fieldName)}:
                                  <span className="hidden group-hover:block absolute left-0 bottom-full mb-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-normal max-w-[200px]">
                                    {getCleanFieldName(fieldName)}
                                    {field?.value && (
                                      <span> ({field?.value})</span>
                                    )}
                                  </span>
                                </span>
                                <span className="text-green-600 font-medium whitespace-nowrap">
                                  +{Number(field.extra_tax).toFixed(2)} euro
                                </span>
                              </div>
                            ))}

                        {(tempCartChanges?.[elm.id]?.word_count_fee ||
                          savedData(elm.id)?.fields?.some(
                            (field) => field.type === "file" && field.wordCount
                          )) && (
                          <div
                            key="word-count-fee"
                            className="word-count-item text-xs flex justify-between items-center border-t border-gray-200 pt-1 mb-1"
                          >
                            <span className="text-gray-600 truncate max-w-[70%]">
                              Document fee:
                            </span>
                            <span className="text-green-600 font-medium whitespace-nowrap">
                              +
                              {Number(
                                tempCartChanges?.[elm.id]?.word_count_fee
                                  ?.extra_tax ||
                                  savedData(elm.id)
                                    ?.find(
                                      (order) => order.service_id === serviceId
                                    )
                                    ?.fields?.filter(
                                      (field) =>
                                        field.type === "file" && field.wordCount
                                    )
                                    ?.reduce(
                                      (total, field) =>
                                        total + field.wordCount * 0.1,
                                      0
                                    )
                                    ?.toFixed(2) ||
                                  0
                              ).toFixed(2)}{" "}
                              euro
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-bold flex justify-between items-center border-t border-gray-300 pt-2 mt-auto text-sm w-full">
                      <span className="whitespace-nowrap">Total:</span>
                      <span className="text-blue-700 whitespace-nowrap overflow-hidden text-ellipsis">
                        {(() => {
                          // First try to use the total_price directly if available
                          if (elm.total_price && elm.total_price > 0) {
                            return Number(elm.total_price).toFixed(2);
                          }

                          // Calculate based on base price and quantity
                          const itemTotal = basePrice * elm.quantity;

                          // Add any extra taxes
                          const extraTaxes =
                            (tempCartChanges && tempCartChanges[elm.id]) ||
                            elm.extraTaxFields
                              ? Object.values(
                                  tempCartChanges?.[elm.id] ||
                                    elm.extraTaxFields
                                ).reduce(
                                  (sum, field) =>
                                    sum + Number(field.extra_tax || 0),
                                  0
                                )
                              : 0;

                          return (itemTotal + extraTaxes).toFixed(2);
                        })()}{" "}
                        euro
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center align-middle h-full">
                    <button
                      className="px-4 py-2 rounded-lg font-medium flex items-center justify-center w-32 mx-auto shadow-sm transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => handleOpenModal(elm)}
                      disabled={loadingItemId === elm.id}
                    >
                      {loadingItemId === elm.id ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        "Check"
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-6">
        {cartItems.map((elm, i) => {
          // Get service data either from nested service object or direct properties
          const serviceData = elm.service || elm;
          const serviceId = elm.service_id || elm.id;
          const categoryId = serviceData.category_id;
          const serviceName = serviceData.name || "Unknown Service";
          const serviceTitle = serviceData.title || serviceName;
          const serviceIcon = serviceData.icon || "/placeholder-image.jpg";
          const basePrice = parseFloat(serviceData.base_price || 0).toFixed(2);

          return (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden relative hover:shadow-lg transition-all duration-300"
              style={{
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                borderLeft: "4px solid #3b82f6",
              }}
            >
              <div className="absolute top-3 right-3 bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full font-medium">
                Service {i + 1}
              </div>
              <div className="flex items-start p-4 border-b">
                <Link
                  href={`/product-detail?serviceId=${serviceId}&categoryId=${categoryId}`}
                  className="flex-shrink-0 mr-3"
                >
                  <Image
                    alt="img-product"
                    src={serviceIcon}
                    width={60}
                    height={60}
                    className="rounded-md shadow-sm"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <Link
                      href={`/product-detail?serviceId=${serviceId}&categoryId=${categoryId}`}
                      className="font-medium text-blue-600 hover:underline text-lg"
                    >
                      {serviceTitle}
                    </Link>
                    <button
                      className="text-red-500 text-sm hover:bg-red-50 p-1 rounded flex items-center gap-2"
                      onClick={() => removeItem(elm.id)}
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{serviceName}</p>
                  <p className="font-bold text-lg mt-2">{basePrice} euro</p>
                </div>
              </div>

              {/* Quantity and pricing section */}
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="wg-quantity bg-white rounded-md px-1 py-1 inline-flex items-center border border-gray-200">
                    <span
                      className="btn-quantity minus-btn w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md cursor-pointer"
                      onClick={() =>
                        setQuantity(elm.id, parseInt(elm.quantity) - 1)
                      }
                      disabled={parseInt(elm.quantity) <= 1}
                    >
                      <svg
                        width={9}
                        height={1}
                        viewBox="0 0 9 1"
                        fill="currentColor"
                      >
                        <path d="M9 1H5.14286H3.85714H0V1.50201e-05H3.85714L5.14286 0L9 1.50201e-05V1Z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      name="number"
                      value={elm.quantity}
                      min={1}
                      className="w-10 text-center border-0 bg-transparent"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 1) {
                          setQuantity(elm.id, value);
                        }
                      }}
                    />
                    <span
                      className="btn-quantity plus-btn w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md cursor-pointer"
                      onClick={() =>
                        setQuantity(elm.id, parseInt(elm.quantity) + 1)
                      }
                    >
                      <svg
                        width={9}
                        height={9}
                        viewBox="0 0 9 9"
                        fill="currentColor"
                      >
                        <path d="M9 5.14286H5.14286V9H3.85714V5.14286H0V3.85714H3.85714V0H5.14286V3.85714H9V5.14286Z" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center py-2 border-t border-gray-200 mb-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">
                    {(basePrice * elm.quantity).toFixed(2)} euro
                  </span>
                </div>

                {/* Extra charges if any */}
                {((tempCartChanges && tempCartChanges[elm.id]) ||
                  elm.extraTaxFields) && (
                  <div className="space-y-1 py-2 border-t border-gray-200">
                    <div className="font-medium text-sm mb-1">
                      Additional charges:
                    </div>
                    {Object.entries(
                      tempCartChanges?.[elm.id] || elm.extraTaxFields
                    ).map(([fieldName, field]) => (
                      <div
                        key={fieldName}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {getCleanFieldName(fieldName)}:
                        </span>
                        <span className="text-green-600">
                          +{Number(field.extra_tax).toFixed(2)} euro
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-300">
                  <span className="font-bold text-gray-800">Total:</span>
                  <span className="font-bold text-blue-700 text-lg">
                    {(() => {
                      // First try to use the total_price directly if available
                      if (elm.total_price && elm.total_price > 0) {
                        return Number(elm.total_price).toFixed(2);
                      }

                      // Calculate based on base price and quantity
                      const itemTotal = basePrice * elm.quantity;

                      // Add any extra taxes
                      const extraTaxes =
                        (tempCartChanges && tempCartChanges[elm.id]) ||
                        elm.extraTaxFields
                          ? Object.values(
                              tempCartChanges?.[elm.id] || elm.extraTaxFields
                            ).reduce(
                              (sum, field) =>
                                sum + Number(field.extra_tax || 0),
                              0
                            )
                          : 0;

                      return (itemTotal + extraTaxes).toFixed(2);
                    })()}{" "}
                    euro
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                <button
                  className="w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center shadow-sm transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => handleOpenModal(elm)}
                  disabled={loadingItemId === elm.id}
                >
                  {loadingItemId === elm.id ? (
                    <Loader2
                      className="animate-spin helm
elm
elm
elm
elm
elm
elm
elm
elm
elm
elm
elm
elm
elm-5 w-5 mr-2"
                    />
                  ) : (
                    <>
                      Check Details
                      <ChevronRight size={16} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartTable;
