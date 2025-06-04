import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { format, differenceInDays, parseISO } from "date-fns";
import Card from "@/components/ui/Card";
import { BASE_URL } from "../../../../api";

const RiderAnalytics = ({ dateRange, onDateRangeChange, height = 400 }) => {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchAnalytics = async (start, end) => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/admin/dashboard/rider-analytics?startDate=${start}&endDate=${end}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.jsonData;
      const dateKeys = Object.keys(data).sort();
      const vehicleTypesSet = new Set();

      dateKeys.forEach((date) => {
        data[date].forEach((item) => {
          vehicleTypesSet.add(item.vehicleType);
        });
      });

      const vehicleTypes = Array.from(vehicleTypesSet);

      const formattedSeries = vehicleTypes.map((vehicleType) => ({
        name: vehicleType,
        data: dateKeys.map((date) => {
          const match = data[date].find((item) => item.vehicleType === vehicleType);
          return match ? match.onlineRiders : 0;
        }),
      }));

      // Add Total Rider Series
      const totalRiderSeries = {
        name: "Total Riders",
        data: dateKeys.map((date) =>
          data[date].reduce((sum, item) => sum + item.onlineRiders, 0)
        ),
      };

      setCategories(dateKeys);
      setSeries([...formattedSeries, totalRiderSeries]);
    } catch (error) {
      console.error("Error fetching rider analytics:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics(dateRange.startDate, dateRange.endDate);
  }, [dateRange]);

  const handleDateChange = (newRange) => {
    const start = parseISO(newRange.startDate);
    const end = parseISO(newRange.endDate);
    const diff = differenceInDays(end, start);

    if (diff > 31) {
      alert("Date range cannot exceed 31 days.");
      return;
    }

    onDateRangeChange(newRange); // Pass the new date range to the parent
    fetchAnalytics(newRange.startDate, newRange.endDate);
  };

  const options = {
    chart: {
      toolbar: { show: false },
      type: "area",
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    fill: {
      type: "solid",
      opacity: 0.1,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: { style: { fontFamily: "Inter" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontFamily: "Inter" } },
      title: {
        text: "Total Online Riders",
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} riders`,
      },
    },
  };

  return (
    <Card>
      {/* Header Row: Title + Datepicker */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Rider Data</h2>
      </div>

      {/* Chart */}
      <div className="legend-ring">
        <Chart options={options} series={series} type="area" height={height} />
      </div>
    </Card>
  );
};

export default RiderAnalytics;
