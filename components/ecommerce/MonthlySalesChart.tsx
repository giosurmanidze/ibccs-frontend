"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import axiosInstance from "@/config/axios";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const [chartData, setChartData] = useState({
    months: [],
    sales: [],
    orders: [],
    loading: true,
    error: false,
  });
  const [chartView, setChartView] = useState("sales");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Inside your fetchMonthlySalesData function
    const fetchMonthlySalesData = async () => {
      try {
        // First try to get data from dashboard-metrics endpoint
        const response = await axiosInstance.get("orders/dashboard-metrics");
        const metrics = response.data.data;

        if (metrics.monthly_sales && Array.isArray(metrics.monthly_sales)) {
          // Extract data for the chart
          // Make sure we're using the months in the correct order
          const months = metrics.monthly_sales.map((item) => item.month);
          const sales = metrics.monthly_sales.map(
            (item) => parseFloat(item.revenue) || 0
          ); // Handle string values
          const orders = metrics.monthly_sales.map(
            (item) => parseInt(item.orders) || 0
          ); // Handle string values

          setChartData({
            months,
            sales,
            orders,
            loading: false,
            error: false,
          });

          console.log("Chart data processed:", { months, sales, orders });
        } else {
          // Set error state instead of using dummy data
          setChartData((prevState) => ({
            ...prevState,
            loading: false,
            error: true,
          }));
        }
      } catch (error) {
        console.error("Error fetching monthly sales data:", error);
        // Set error state instead of using dummy data
        setChartData((prevState) => ({
          ...prevState,
          loading: false,
          error: true,
        }));
      }
    };

    fetchMonthlySalesData();
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const toggleChartView = () => {
    setChartView(chartView === "sales" ? "orders" : "sales");
    closeDropdown();
  };

  // Determine chart options based on current state
  const getChartOptions = (): ApexOptions => {
    return {
      colors: chartView === "sales" ? ["#465fff"] : ["#34d399"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 180,
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "39%",
          borderRadius: 5,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 4,
        colors: ["transparent"],
      },
      xaxis: {
        categories: chartData.months,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: "#64748b",
            fontFamily: "Outfit, sans-serif",
          },
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontFamily: "Outfit",
        offsetY: 0,
        offsetX: 0,
        labels: {
          colors: "#64748b",
        },
      },
      yaxis: {
        title: {
          text: undefined,
        },
        labels: {
          style: {
            colors: "#64748b",
            fontFamily: "Outfit, sans-serif",
          },
          formatter: (value) => {
            if (chartView === "sales") {
              return `$${value}`;
            }
            return value.toString();
          },
        },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        x: {
          show: false,
        },
        y: {
          formatter: (val: number) =>
            chartView === "sales" ? `$${val}` : `${val} orders`,
        },
        theme: "dark",
      },
    };
  };

  // Create the series based on current view
  const getChartSeries = () => {
    return [
      {
        name: chartView === "sales" ? "Revenue" : "Orders",
        data: chartView === "sales" ? chartData.sales : chartData.orders,
      },
    ];
  };

  // Function to retry data fetching
  const handleRetry = async () => {
    setChartData((prevState) => ({
      ...prevState,
      loading: true,
      error: false,
    }));

    try {
      const response = await axiosInstance.get("dashboard-metrics");
      const metrics = response.data.data;

      if (metrics.monthly_sales && Array.isArray(metrics.monthly_sales)) {
        const months = metrics.monthly_sales.map((item) => item.month);
        const sales = metrics.monthly_sales.map(
          (item) => parseFloat(item.revenue) || 0
        );
        const orders = metrics.monthly_sales.map(
          (item) => parseInt(item.orders) || 0
        );

        setChartData({
          months,
          sales,
          orders,
          loading: false,
          error: false,
        });
      } else {
        setChartData((prevState) => ({
          ...prevState,
          loading: false,
          error: true,
        }));
      }
    } catch (error) {
      console.error("Error retrying data fetch:", error);
      setChartData((prevState) => ({
        ...prevState,
        loading: false,
        error: true,
      }));
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly {chartView === "sales" ? "Sales" : "Orders"}
        </h3>

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
              <DropdownItem onClick={toggleChartView}>
                Switch to {chartView === "sales" ? "Orders" : "Sales"}
              </DropdownItem>
              {chartData.error && (
                <DropdownItem onClick={handleRetry}>
                  Retry Loading Data
                </DropdownItem>
              )}
            </Dropdown>
          )}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        {chartData.loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-gray-400">
              Loading chart data...
            </div>
          </div>
        ) : chartData.error ? (
          <div className="flex flex-col items-center justify-center h-40">
            <div className="text-red-500 mb-3">
              Could not load data from database
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={getChartOptions()}
              series={getChartSeries()}
              type="bar"
              height={180}
            />
          </div>
        )}
      </div>
    </div>
  );
}
