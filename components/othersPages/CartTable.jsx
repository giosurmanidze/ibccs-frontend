import { Trash2, Loader2, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CartTable = ({
  cartItems,
  removeItem,
  setQuantity,
  handleOpenModal,
  loadingItemId,
  tempCartChanges,
  savedData,
  getCleanFieldName,
  fetchCartData2,
  updateQuantity,
  fetchCartData,
}) => {
  const handleQuantityChange = async (id, condition, basePrice) => {
    if (!basePrice) {
      const cartItem = cartItems.find((item) => item.id == id);
      if (cartItem) {
        basePrice = cartItem.base_price;
      }
    }

    try {
      await updateQuantity(id, condition, basePrice);
      await fetchCartData();
      await fetchCartData2();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  // Helper function to get extra tax fields from an item
  const getExtraTaxFields = (item) => {

    // First check tempCartChanges
    if (tempCartChanges && tempCartChanges[item.id]) {
      // Filter out word_count_fee
      const filteredChanges = { ...tempCartChanges[item.id] };
      delete filteredChanges.word_count_fee;
      return filteredChanges;
    }
    // Then check item.extraTaxFields
    else if (item.extraTaxFields) {
      const filteredTaxFields = { ...item.extraTaxFields };
      delete filteredTaxFields.word_count_fee;
      return filteredTaxFields;
    }
    else if (item.fields) {
      try {
        const result = {};
        const fieldsArray =
          typeof item.fields === "string"
            ? JSON.parse(item.fields)
            : item.fields;

        // Look through fields for any with extra_tax
        fieldsArray.forEach((field) => {
          // Check if the value contains extra_tax
          if (
            field.value &&
            typeof field.value === "string" &&
            field.value.includes("extra_tax")
          ) {
            try {
              const valueObj = JSON.parse(field.value);
              if (valueObj.extra_tax) {
                result[field.name] = {
                  name: field.name,
                  value: valueObj.text,
                  extra_tax: valueObj.extra_tax,
                  displayName: getCleanFieldName(field.name),
                };
              }
            } catch (e) {
              console.error("Error parsing field value JSON:", e);
            }
          }

          // Also check if the options contain extra_tax (for radio/dropdown fields)
          if (field.options && typeof field.options === "object") {
            Object.values(field.options).forEach((option) => {
              if (option.extra_tax) {
                // Check if this option is selected by examining the field value
                if (field.value && field.value.includes(option.text)) {
                  result[field.name] = {
                    name: field.name,
                    value: option.text,
                    extra_tax: option.extra_tax,
                    displayName: getCleanFieldName(field.name),
                  };
                }
              }
            });
          }
        });

        return result;
      } catch (e) {
        console.error("Error parsing fields JSON:", e);
        return {};
      }
    }

    console.log("No extra taxes found for item:", item.id);
    return {};
  };

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto rounded-lg shadow-lg border border-gray-200">
        <table className="min-w-full bg-white text-gray-800">
          <thead className="bg-[#000000] text-white uppercase text-sm">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left w-1/3 xl:w-1/4">
                Service
              </th>
              <th className="px-2 sm:px-3 py-3 text-center w-24 hidden sm:table-cell">
                Price
              </th>
              <th className="px-2 sm:px-3 py-3 text-center w-24 hidden sm:table-cell">
                Qty
              </th>
              <th className="px-3 sm:px-4 py-3 text-center">Price Details</th>
              <th className="px-2 sm:px-4 py-3 text-center w-20 lg:w-28">
                Actions
              </th>
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

              // Get all extra tax fields (excluding word count)
              const extraTaxFields = getExtraTaxFields(elm);
              const hasExtraTaxes = Object.keys(extraTaxFields).length > 0;

              // Calculate total extra taxes
              const totalExtraTax = hasExtraTaxes
                ? Object.values(extraTaxFields).reduce(
                    (sum, field) => sum + parseFloat(field.extra_tax || 0),
                    0
                  )
                : 0;

              return (
                <tr
                  key={i}
                  className="border-b hover:bg-blue-50 transition group"
                >
                  {/* Service column - responsive for all screens */}
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Link
                        href={`/product-detail?serviceId=${serviceId}&categoryId=${categoryId}`}
                        className="flex-shrink-0 hidden sm:block"
                      >
                        <Image
                          alt={serviceName}
                          src={serviceIcon}
                          width={50}
                          height={50}
                          className="rounded-md shadow-sm"
                        />
                      </Link>
                      <div className="flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <Link
                            href={`/product-detail?serviceId=${serviceId}&categoryId=${categoryId}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {serviceTitle}
                          </Link>
                          <span className="text-xs text-gray-500 sm:hidden">
                            {basePrice} euro × {elm.quantity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 hidden sm:block">
                          {category}
                        </p>
                        <button
                          className="text-red-600 text-xs sm:text-sm hover:underline mt-1 flex items-center"
                          onClick={() => removeItem(elm.id)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Price column - hidden on mobile */}
                  <td className="px-2 sm:px-3 py-4 text-center align-middle hidden sm:table-cell">
                    <span className="font-medium text-sm whitespace-nowrap">
                      {basePrice} euro
                    </span>
                  </td>

                  {/* Quantity column - hidden on mobile */}
                  <td className="px-2 sm:px-3 py-4 text-center align-middle hidden sm:table-cell">
                    <div className="cart-quantity flex justify-center">
                      <div className="wg-quantity bg-gray-100 rounded-md px-1 py-1 inline-flex items-center">
                        <span
                          className="btn-quantity minus-btn w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            handleQuantityChange(
                              elm.id,
                              "decrement",
                              elm.base_price
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <svg
                            width={8}
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
                          className="w-8 sm:w-10 text-center border-0 bg-transparent pointer-events-none text-sm"
                          aria-label="Quantity"
                        />
                        <span
                          className="btn-quantity plus-btn w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            handleQuantityChange(
                              elm.id,
                              "increment",
                              elm.base_price
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          <svg
                            width={8}
                            height={8}
                            viewBox="0 0 9 9"
                            fill="currentColor"
                          >
                            <path d="M9 5.14286H5.14286V9H3.85714V5.14286H0V3.85714H3.85714V0H5.14286V3.85714H9V5.14286Z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price Details column - responsive for all screens */}
                  <td className="px-3 sm:px-4 py-4 align-middle">
                    <div className="flex flex-col h-full w-full max-w-xs sm:max-w-none mx-auto">
                      {/* Mobile quantity controls - only visible on mobile */}
                      <div className="sm:hidden flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="wg-quantity bg-gray-100 rounded-md px-1 py-1 inline-flex items-center">
                          <span
                            className="btn-quantity minus-btn w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                            onClick={() =>
                              handleQuantityChange(
                                elm.id,
                                "decrement",
                                elm.base_price
                              )
                            }
                          >
                            <svg
                              width={8}
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
                            className="w-8 text-center border-0 bg-transparent pointer-events-none text-sm"
                          />
                          <span
                            className="btn-quantity plus-btn w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                            onClick={() =>
                              handleQuantityChange(
                                elm.id,
                                "increment",
                                elm.base_price
                              )
                            }
                          >
                            <svg
                              width={8}
                              height={8}
                              viewBox="0 0 9 9"
                              fill="currentColor"
                            >
                              <path d="M9 5.14286H5.14286V9H3.85714V5.14286H0V3.85714H3.85714V0H5.14286V3.85714H9V5.14286Z" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {/* Base price calculation - compact */}
                      <div className="bg-gray-50 p-2 sm:p-3 rounded-md mb-2 shadow-sm text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Base ({basePrice} × {elm.quantity}):
                          </span>
                          <span className="font-medium">
                            {(basePrice * elm.quantity).toFixed(2)} euro
                          </span>
                        </div>

                        {/* Extra taxes - compact display */}
                        {hasExtraTaxes && (
                          <div className="mt-1 pt-1 border-t border-gray-200">
                            <div className="flex flex-col space-y-1">
                              {Object.entries(extraTaxFields).map(
                                ([fieldName, field]) => (
                                  <div
                                    key={fieldName}
                                    className="flex justify-between items-center"
                                  >
                                    <span className="text-blue-600  max-w-[180px] sm:max-w-[300px] group relative cursor-help">
                                      {field.displayName ||
                                        getCleanFieldName(fieldName)}
                                      :
                                      <span className="hidden group-hover:block absolute left-0 bottom-full mb-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-normal max-w-[200px]">
                                        <span className="font-bold">
                                          {field.displayName ||
                                            getCleanFieldName(fieldName)}
                                        </span>
                                        {field.value && (
                                          <span> ({field.value})</span>
                                        )}
                                      </span>
                                    </span>
                                    <span className="text-green-600 font-medium whitespace-nowrap">
                                      +{Number(field.extra_tax).toFixed(2)} euro
                                    </span>
                                  </div>
                                )
                              )}

                              {/* Extra tax calculations if quantity > 1 */}
                              {elm.quantity > 1 && (
                                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                                  <span className="text-gray-600">
                                    Extra × {elm.quantity}:
                                  </span>
                                  <span className="text-green-600 font-medium">
                                    +{(totalExtraTax * elm.quantity).toFixed(2)}{" "}
                                    euro
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Total price */}
                      <div className="font-bold flex justify-between items-center bg-blue-50 p-2 rounded-md shadow-sm text-sm">
                        <span className="text-gray-800">Total:</span>
                        <span className="text-blue-700 font-bold">
                          {elm.total_price} euro
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Actions column */}
                  <td className="px-2 sm:px-4 py-4 text-center align-middle">
                    <button
                      className="px-2 sm:px-4 py-2 rounded-lg font-medium flex items-center justify-center w-full sm:w-auto mx-auto shadow-sm transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm"
                      onClick={() => handleOpenModal(elm)}
                      disabled={loadingItemId === elm.id}
                    >
                      {loadingItemId === elm.id ? (
                        <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <>
                          Check
                          <ChevronRight
                            size={16}
                            className="ml-1 hidden sm:inline"
                          />
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-6">
  {cartItems.map((elm, i) => {
    const serviceData = elm.service || elm;
    const serviceId = elm.service_id || elm.id;
    const categoryId = serviceData.category_id;
    const serviceName = serviceData.name || "Unknown Service";
    const serviceTitle = serviceData.title || serviceName;
    const serviceIcon = serviceData.icon || "/placeholder-image.jpg";
    const basePrice = parseFloat(serviceData.base_price || 0).toFixed(2);

    const extraTaxFields = getExtraTaxFields(elm);
    const hasExtraTaxes = Object.keys(extraTaxFields).length > 0;
    
    const totalExtraTax = hasExtraTaxes 
      ? Object.values(extraTaxFields).reduce((sum, field) => sum + parseFloat(field.extra_tax || 0), 0) 
      : 0;

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
            <div className="flex items-center mt-2">
              <span className="font-bold text-lg">{basePrice} euro</span>
              <span className="text-gray-500 text-sm ml-2">per unit</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-medium">Quantity:</span>
            <div className="wg-quantity bg-white rounded-md px-1 py-1 inline-flex items-center border border-gray-200">
              <span
                className="btn-quantity minus-btn w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md cursor-pointer"
                onClick={() => handleQuantityChange(elm.id, "decrement", elm.base_price)}
              >
                <svg width={9} height={1} viewBox="0 0 9 1" fill="currentColor">
                  <path d="M9 1H5.14286H3.85714H0V1.50201e-05H3.85714L5.14286 0L9 1.50201e-05V1Z" />
                </svg>
              </span>
              <input
                type="text"
                name="number"
                value={elm.quantity}
                min={1}
                className="w-10 text-center border-0 bg-transparent"
                readOnly
              />
              <span
                className="btn-quantity plus-btn w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md cursor-pointer"
                onClick={() => handleQuantityChange(elm.id, "increment", elm.base_price)}
              >
                <svg width={9} height={9} viewBox="0 0 9 9" fill="currentColor">
                  <path d="M9 5.14286H5.14286V9H3.85714V5.14286H0V3.85714H3.85714V0H5.14286V3.85714H9V5.14286Z" />
                </svg>
              </span>
            </div>
          </div>
          
          {/* Price Breakdown Card */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
            <h6 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">Price Breakdown</h6>
            
            {/* Base price calculation */}
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-600">Base price:</span>
              <span className="font-medium">{basePrice} euro</span>
            </div>
            
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">× {elm.quantity}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2 mt-1">
              <span className="text-gray-700 font-semibold">Subtotal:</span>
              <span className="font-semibold">{(basePrice * elm.quantity).toFixed(2)} euro</span>
            </div>
          </div>

          {/* Extra Charges Section */}
          {hasExtraTaxes && (
            <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
              <h6 className="text-sm font-semibold text-blue-700 mb-2 border-b border-blue-100 pb-1">Extra Charges</h6>
              
              {Object.entries(extraTaxFields).map(([fieldName, field]) => (
                <div key={fieldName} className="flex justify-between items-center text-sm mb-1 group relative">
                  <span className="text-blue-600 truncate max-w-[70%] cursor-help">
                    {field.displayName || getCleanFieldName(fieldName)}:
                    <span className="hidden group-hover:block absolute left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-normal max-w-[250px]">
                      <span className="font-bold block">{field.displayName || getCleanFieldName(fieldName)}</span>
                      {field.value && <span className="block mt-1">Selected: {field.value}</span>}
                      <span className="block mt-1 text-blue-300">Extra charge applied to this service</span>
                    </span>
                  </span>
                  <span className="text-green-600 font-medium">+{Number(field.extra_tax).toFixed(2)} euro</span>
                </div>
              ))}
              
              {/* Show extra tax subtotal if multiple charges exist */}
              {Object.keys(extraTaxFields).length > 1 && (
                <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2 mt-1">
                  <span className="text-gray-700 font-medium">Extra charges subtotal:</span>
                  <span className="text-green-600 font-medium">+{totalExtraTax.toFixed(2)} euro</span>
                </div>
              )}
              
              {/* Show total with quantity if quantity > 1 */}
              {elm.quantity > 1 && (
                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="text-gray-700 font-medium">Extra charges × {elm.quantity}:</span>
                  <span className="text-green-600 font-medium">+{(totalExtraTax * elm.quantity).toFixed(2)} euro</span>
                </div>
              )}
            </div>
          )}
          
          {!hasExtraTaxes && elm.total_price && elm.service?.base_price && (() => {
            const baseTotalPrice = parseFloat(elm.service.base_price) * elm.quantity;
            const totalPrice = parseFloat(elm.total_price);
            const difference = totalPrice - baseTotalPrice;

            if (difference > 0.01) {
              return (
                <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
                  <h6 className="text-sm font-semibold text-blue-700 mb-2 border-b border-blue-100 pb-1">Extra Charges</h6>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600">Additional services:</span>
                    <span className="text-green-600 font-medium">+{difference.toFixed(2)} euro</span>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Total Section */}
          <div className="bg-blue-100 rounded-lg shadow-sm p-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">Total Price:</span>
              <span className="font-bold text-blue-700 text-lg">{elm.total_price} euro</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <button
            className="w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center shadow-sm transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => handleOpenModal(elm)}
            disabled={loadingItemId === elm.id}
          >
            {loadingItemId === elm.id ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
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
