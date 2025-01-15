import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart";
import RadialsChart from "@/components/partials/widget/chart/radials";
import SelectMonth from "@/components/partials/SelectMonth";
import RecentCompletedOrders from "@/components/partials/Table/recent-completed-orders";
import HomeBredCurbs from "./HomeBredCurbs";
import { BASE_URL } from "../../api";
import OnRoleRiders from "../riders/on-role-riders";
import axiosInstance from "../../api";

const Dashboard = () => {
  const[orderData, setOrderData] = useState([]);
  const serviceAreaId = localStorage.getItem('serviceAreaId');
  useEffect(() => {
    const fetchOrderData = async () => {
      const token = localStorage.getItem("jwtToken");
      try {
        const responseCompleted = await axiosInstance.post(`${BASE_URL}/order-history/orders/count-total/${serviceAreaId}`,{ type: "COMPLETED" }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const responseIncoming = await axiosInstance.post(`${BASE_URL}/order-history/orders/count-total/${serviceAreaId}`,{ type: "INCOMING" }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrderData({
          responseCompleted: responseCompleted.data,
          responseIncoming: responseIncoming.data,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } 
    };
    fetchOrderData();
  }, [serviceAreaId]);


  return (
    <div>
      <HomeBredCurbs title="Dashboard" />
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="2xl:col-span-12 lg:col-span-12 col-span-12">
          <Card bodyClass="p-4">
            <div className="grid md:grid-cols-3 col-span-1 gap-4">
              <div className={`py-[18px] px-4 rounded-[6px] bg-[#E5F9FF] dark:bg-scooton-900	`}>
                <div className="flex items-center space-x-6 rtl:space-x-reverse">                  
                  <div className="flex-1">
                    <div className="text-slate-800 dark:text-slate-300 text-sm mb-1 font-medium">
                      Total Placed Order
                    </div>
                    <div className="text-slate-900 dark:text-white tet-lg font-medium">
                      {orderData.responseIncoming}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`py-[18px] px-4 rounded-[6px] bg-[#FFEDE5] dark:bg-scooton-900`}>
                <div className="flex items-center space-x-6 rtl:space-x-reverse">                  
                  <div className="flex-1">
                    <div className="text-slate-800 dark:text-slate-300 text-sm mb-1 font-medium">
                      Total Order Delivered
                    </div>
                    <div className="text-slate-900 dark:text-white tet-lg font-medium">
                      {orderData.responseCompleted}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-8 col-span-12">
          <Card>
            <div className="legend-ring">
              <RevenueBarChart />
            </div>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-12">
          <Card title="Overview" headerslot={<SelectMonth />}>
            <RadialsChart />
          </Card>
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
