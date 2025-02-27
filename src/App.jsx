import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// home pages  & dashboard
//import Dashboard from "./pages/dashboard";
const Dashboard = lazy(() => import("./pages/dashboard"));

const Login = lazy(() => import("./pages/auth/login"));
const Register = lazy(() => import("./pages/auth/register"));
const ForgotPass = lazy(() => import("./pages/auth/forgot-password"));
const Error = lazy(() => import("./pages/404"));

import Layout from "./layout/Layout";


// const Settings = lazy(() => import("./pages/utility/settings"));
const Profile = lazy(() => import("./pages/utility/profile"));
const NotificationPage = lazy(() => import("./pages/utility/notifications"));



import Loading from "@/components/Loading";
import UserList from "./pages/users/user-list";
import ServiceAreaList from "./pages/service-area/service-area-list";
import AddServiceArea from "./pages/service-area/add-service-area";
import RoleList from "./pages/role/role-list";
import AddRole from "./pages/role/add-role";
import PromocodeList from "./pages/promocode/promocode-list";
import AllRiders from "./pages/riders/all-riders";
import RegisteredRiders from "./pages/riders/registered-rider";
import NonRegisteredRiders from "./pages/riders/non-registered-riders";
import OnRoleRiders from "./pages/riders/on-role-riders";
import AllOrders from "./pages/orders/all-orders";
import CityWideOrders from "./pages/orders/citywide-orders";
import OfflineOrders from "./pages/orders/offline-orders";
import CreateOrder from "./pages/orders/create-order";
import AddPromocode from "./pages/promocode/add-promocode";
import OrderDetail from "./pages/orders/order-detail";
import RiderDetail from "./pages/riders/rider-detail";
import HomepageList from "./pages/home-page/home-page-list";
import Settings from "./pages/configuration/setting";
import AddHomePage from "./pages/home-page/add-homepage";
import Vendor from "./pages/orders/vendor-order";
import ProtectedRoute from "./layout/ProtectedRoute";
function App() {

 
 
  return (
    <main className="App  relative h-100">
      <Routes>
        
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          }
        />
        
        <Route
          path="/register"
          element={
            <Suspense fallback={<Loading />}>
              <Register />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<Loading />}>
              <ForgotPass />
            </Suspense>
          }
        />
        <Route path="/*" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="profile" element={<Profile />} />
         
          <Route path="notifications" element={<NotificationPage />} />

          <Route path="user-list" element={<UserList />} />
          <Route path="service-area-list" element={<ServiceAreaList />} />
          <Route path="add-service-area" element={<AddServiceArea />} />
          <Route path="promocode-list" element={<PromocodeList />} />
          <Route path="add-promocode" element={<AddPromocode />} />
          <Route path="all-riders" element={<AllRiders />} />
          <Route path="registered-riders" element={<RegisteredRiders />} />
          <Route path="non-registered-riders" element={<NonRegisteredRiders />} />
          <Route path="on-role-riders" element={<OnRoleRiders />} />
          <Route path="rider-detail/:riderId" element={<RiderDetail />} />
          <Route path="all-orders" element={<AllOrders />} />
          <Route path="all-orders/:id/:ordertype/:search" element={<AllOrders />} />
          <Route path="all-orders/:ordertype" element={<AllOrders />} />
          <Route path="citywide-orders" element={<CityWideOrders />} />
          <Route path="offline-orders" element={<OfflineOrders />} />
          <Route path="create-orders" element={<CreateOrder />} />
          <Route path="order-detail/:orderId" element={<OrderDetail />} />
          <Route path="order-detail/:thirdPartyUsername/:orderId" element={<OrderDetail />} />
          <Route path="add-homepage" element={<AddHomePage />} />
          <Route path="homepage-list" element={<HomepageList />} />
          <Route path = ":vendor" element={<Vendor />} />
          <Route element={<ProtectedRoute isAuthRoute={"ROLE_SUPER_ADMIN"} />}>
            <Route path="setting" element={<Settings />} />
            <Route path="role-list" element={<RoleList />} />
            <Route path="add-role" element={<AddRole />} />
          </Route>
            
          <Route path="*" element={<Navigate to="/404" />} />
        </Route>
        <Route
          path="/404"
          element={
            <Suspense fallback={<Loading />}>
              <Error />
            </Suspense>
          }
        />
        
      </Routes>
    </main>
  );
}

export default App;
