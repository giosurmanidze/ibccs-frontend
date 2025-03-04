import { useState, useEffect } from "react";
import CountryMap from "./CountryMap";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import axiosInstance from "@/config/axios";
import Flag from "react-world-flags";

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demographics, setDemographics] = useState({});
  const [timeframe, setTimeframe] = useState("month");

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleTimeframeChange(newTimeframe) {
    setTimeframe(newTimeframe);
    closeDropdown();
    fetchDemographics(newTimeframe);
  }

  const fetchDemographics = async (selectedTimeframe = timeframe) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/customer-demographics?timeframe=${selectedTimeframe}`
      );

      if (response.data && response.data.data) {
        setDemographics(response.data.data);
      }
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching demographic data:", error);
      setError("Could not load demographic data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemographics();
  }, []);

  const formattedDemographics = Object.keys(demographics).map(
    (countryCode) => ({
      countryCode,
      customers: demographics[countryCode],
    })
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Customers Demographic
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of customers based on country
          </p>
        </div>

        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="inline-flex items-center gap-2 rounded-md bg-transparent p-1.5 text-sm font-medium text-slate-700 hover:bg-gray-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <MoreDotIcon className="h-4 w-4" />
          </button>

          {isOpen && (
            <Dropdown
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              className="right-0 top-full mt-1 min-w-[160px]"
            >
              <DropdownItem
                onClick={() => handleTimeframeChange("week")}
                className={
                  timeframe === "week" ? "bg-gray-100 dark:bg-gray-800" : ""
                }
              >
                This Week
              </DropdownItem>
              <DropdownItem
                onClick={() => handleTimeframeChange("month")}
                className={
                  timeframe === "month" ? "bg-gray-100 dark:bg-gray-800" : ""
                }
              >
                This Month
              </DropdownItem>
              <DropdownItem
                onClick={() => handleTimeframeChange("year")}
                className={
                  timeframe === "year" ? "bg-gray-100 dark:bg-gray-800" : ""
                }
              >
                This Year
              </DropdownItem>
              <DropdownItem onClick={() => fetchDemographics(timeframe)}>
                Refresh Data
              </DropdownItem>
            </Dropdown>
          )}
        </div>
      </div>

      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap countries={formattedDemographics} />
        </div>
      </div>

      <div className="space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-gray-400">
              Loading demographic data...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : formattedDemographics.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No demographic data available</p>
          </div>
        ) : (
          formattedDemographics.slice(0, 5).map((country, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flag code={country.countryCode} className="w-6 h-6" />
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {country.countryCode}
                  </p>
                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                    {country.customers.toLocaleString()} Customers
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
