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

  const sortedDemographics = [...formattedDemographics].sort(
    (a, b) => b.customers - a.customers
  );

  // Calculate total customers to show percentages
  const totalCustomers = formattedDemographics.reduce(
    (sum, country) => sum + country.customers, 
    0
  );

  // Get timeframe text
  const timeframeText = {
    week: "This Week",
    month: "This Month",
    year: "This Year"
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg dark:from-gray-800 dark:to-gray-900">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                Customer Demographics
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {timeframeText[timeframe]} • {totalCustomers.toLocaleString()} total customers
            </p>
          </div>

          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 p-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="More options"
            >
              <MoreDotIcon className="h-4 w-4" />
            </button>

            {isOpen && (
              <Dropdown
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                className="right-0 top-full mt-1 min-w-[160px] rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <DropdownItem
                  onClick={() => handleTimeframeChange("week")}
                  className={`rounded-lg transition-colors ${
                    timeframe === "week" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""
                  }`}
                >
                  This Week
                </DropdownItem>
                <DropdownItem
                  onClick={() => handleTimeframeChange("month")}
                  className={`rounded-lg transition-colors ${
                    timeframe === "month" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""
                  }`}
                >
                  This Month
                </DropdownItem>
                <DropdownItem
                  onClick={() => handleTimeframeChange("year")}
                  className={`rounded-lg transition-colors ${
                    timeframe === "year" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""
                  }`}
                >
                  This Year
                </DropdownItem>
                <DropdownItem 
                  onClick={() => fetchDemographics(timeframe)}
                  className="rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Refresh Data
                </DropdownItem>
              </Dropdown>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl bg-blue-50/50 dark:bg-blue-900/10">
          <div className="p-4 sm:p-6">
            <div
              id="mapOne"
              className="mapOne relative h-[220px] w-full overflow-hidden rounded-lg"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <CountryMap countries={formattedDemographics} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Top Countries</h4>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
                <p className="text-sm text-gray-400">Loading demographic data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center rounded-lg bg-red-50 py-6 dark:bg-red-900/10">
              <div className="text-red-500">{error}</div>
            </div>
          ) : sortedDemographics.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg bg-gray-50 py-6 dark:bg-gray-800">
              <p className="text-gray-500">No demographic data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDemographics.slice(0, 5).map((country, index) => {
                const percentage = (country.customers / totalCustomers) * 100;
                return (
                  <div key={index} className="group space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 p-1 ring-2 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                          <Flag code={country.countryCode} className="h-6 w-6 rounded object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white/90">
                            {country.countryCode}
                          </p>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {country.customers.toLocaleString()} customers ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {index + 1}
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div 
                        className="h-full rounded-full bg-blue-500 transition-all duration-500 group-hover:bg-blue-600" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}