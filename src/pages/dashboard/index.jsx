import React, { useState, useEffect } from "react";
import { format } from "date-fns";  // Import the 'format' function
import Card from "@/components/ui/Card";
import RadialsChart from "@/components/partials/widget/chart/radials";
import SelectMonth from "@/components/partials/SelectMonth";
import RecentCompletedOrders from "@/components/partials/Table/recent-completed-orders";
import HomeBredCurbs from "./HomeBredCurbs";
import { BASE_URL } from "../../api";
import OnRoleRiders from "../riders/on-role-riders";
import axiosInstance from "../../api";
import RiderAnalytics from "@/components/partials/widget/chart/rider-analytics";
import OrderAnalytics from "@/components/partials/widget/chart/order-analytics";

const Dashboard = () => {
  const [CompletedOrders, setCompletedOrders] = useState("");
  const [IncomingOrders, setIncomingOrders] = useState("");
  const [cashPaymentOrders, setcashPaymentOrders] = useState("");
  const [onlinePaymentOrders, setonlinePaymentOrders] = useState("");
  const serviceAreaId = localStorage.getItem('serviceAreaId');

  const [activeRiders, setActiveRiders] = useState(0);
  const [onRoleRiders, setOnRoleRiders] = useState(0);
  const [totalRiders, setTotalRiders] = useState(0);
  const [unregisteredRiders, setUnregisteredRiders] = useState(0);

  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 6)), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await axiosInstance.get(
          `${BASE_URL}/order-history/orders/get-all-riders-count`
        );

        console.log("API Response:", response.data.data);

        setActiveRiders(response.data.data.activeRiders || 0);
        setOnRoleRiders(response.data.data.onRoleRiders || 0);
        setTotalRiders(response.data.data.totalRiders || 0);
        setUnregisteredRiders(response.data.data.unregisteredRiders || 0);
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    fetchOrderData();
  }, []);

  useEffect(() => {
    const fetchOrderData = async () => {
      const token = localStorage.getItem("jwtToken");
      try {
        const responseCompleted = await axiosInstance.post(`${BASE_URL}/order-history/orders/count-total/city-wide`,).then((response) => {
          console.log("resp", response.data.data.CompletedOrders)
          setCompletedOrders(response.data.data.CompletedOrders);
          setIncomingOrders(response.data.data.IncomingOrders);
          setcashPaymentOrders(response.data.data.cashPaymentOrders);
          setonlinePaymentOrders(response.data.data.onlinePaymentOrders);
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } 
    };
    fetchOrderData();
  }, [serviceAreaId]);

  return (
    <div>
      <HomeBredCurbs title="Dashboard" onDateRangeChange={handleDateRangeChange} />
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="2xl:col-span-12 lg:col-span-12 col-span-12">
          <Card bodyClass="p-4">
            <div className="grid md:grid-cols-4 col-span-1 gap-4">
              <div className={`py-[18px] px-4 rounded-[6px] bg-[#E5F9FF] dark:bg-scooton-900	`}>
                <div className="flex items-center space-x-6 rtl:space-x-reverse">                  
                  <div className="flex-1">
                    <div className="text-slate-800 dark:text-slate-300 text-md mb-1 font-medium">
                      Completed Orders
                    </div>
                    <div className="text-slate-900 dark:text-white tet-lg font-medium">
                      {CompletedOrders}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`py-[18px] px-4 rounded-[6px] bg-[#FFEDE5] dark:bg-scooton-900`}>
                <div className="flex items-center space-x-6 rtl:space-x-reverse">                  
                  <div className="flex-1">
                    <div className="text-slate-800 dark:text-slate-300 text-md mb-1 font-medium">
                      Incoming Orders
                    </div>
                    <div className="text-slate-900 dark:text-white tet-lg font-medium">
                      {IncomingOrders}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`py-[18px] px-4 rounded-[6px] bg-[#E1F0D2] dark:bg-scooton-900`}>
                <div className="flex items-center space-x-6 rtl:space-x-reverse">                  
                  <div className="flex-1">
                    <div className="text-slate-800 dark:text-slate-300 text-md mb-1 font-medium">
                      Cash Payment Orders
                    </div>
                    <div className="text-slate-900 dark:text-white tet-lg font-medium">
                      {cashPaymentOrders}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`py-[18px] px-4 rounded-[6px] bg-[#FFE5F2] dark:bg-scooton-900`}>
                <div className="flex items-center space-x-6 rtl:space-x-reverse">                  
                  <div className="flex-1">
                    <div className="text-slate-800 dark:text-slate-300 text-md mb-1 font-medium">
                      Online Payment Orders
                    </div>
                    <div className="text-slate-900 dark:text-white tet-lg font-medium">
                      {onlinePaymentOrders}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="lg:col-span-12 col-span-12">
          <RiderAnalytics dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
        </div>
        <div className="lg:col-span-12 col-span-12">
          <OrderAnalytics dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
        </div>
        <div className="lg:col-span-12 col-span-12">
          <Card title="Recent Completed Orders">
            <RecentCompletedOrders />
          </Card>
        </div>
        <div className="lg:col-span-12 col-span-12">
          <OnRoleRiders />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
