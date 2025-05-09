import React, { useEffect, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import { Icon } from "@iconify/react/dist/iconify.js";
import { BASE_URL } from "../../api";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../components/ui/Modal";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { TabPanel, Tabs, Tab, TabList } from "react-tabs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import CircularProgress from "@mui/material/CircularProgress";
import axiosInstance from "../../api";

const Settings = () => {
    const navigate = useNavigate();
    const[logoutAll, setLogoutAllList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logoutDevice, setLogoutDevice] = useState();
    const [isLogoutModal, setIsLogoutModal] = useState(false);   

    useEffect(() => {
      const fetchLogoutAllList = async () => {
        try {
          const token = localStorage.getItem('jwtToken');
          if (token) {
            const response = await axiosInstance.get(`${BASE_URL}/auth/get-logout-details`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const validLogoutList = response.data.filter(item => !item.isExpired);

            setLogoutAllList(validLogoutList);
          }
        } catch (error) {
          console.error('Error fetching order detail:', error);
        } finally {
            setLoading(false);
        }
      };  
      fetchLogoutAllList();
    }, []);

    const allRidersOnline = () => {
        try{
            axiosInstance.post(`${BASE_URL}/auth/register-rider-online`).then((response) => {
                toast.success("Register riders online  successfully!");
            })
        }catch{
            if (error.response && error.response.status === 401) {
            navigate("/");
            toast.error("Unauthorized. Please log in again.");
            } else {
            toast.error("Error while updating. Please try again.");
            }
        }
    }

    const logoutModal = () => {
        setIsLogoutModal(true)
    }

    const logoutAllDevice = () => {
       try{
        axiosInstance.post(`${BASE_URL}/auth/logout-all-device`,0).then((response) => {
            toast.success("All Device Logout Successfully")
            localStorage.clear("jwtToken")
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
       }catch{
         toast.error("Promocode not updated successfully!");
       }
    }

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loadingCSV, setLoadingCSV] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const handleStartDateChange = (newValue) => {
        setStartDate(newValue);
        validateDateRange(newValue, endDate);
    };

    const handleEndDateChange = (newValue) => {
        setEndDate(newValue);
        validateDateRange(startDate, newValue);
    };

    const validateDateRange = (start, end) => {
        if (start && end) {
        const differenceInDays = dayjs(end).diff(dayjs(start), "day") + 1;
        setIsButtonDisabled(differenceInDays > 30 || differenceInDays <= 0);
        } else {
        setIsButtonDisabled(true);
        }
    };

    const exportRiderCsv = async () => {
        try{
            setLoadingCSV(true);
            await axiosInstance.get(`${BASE_URL}/order/admin/registered-rider-details`).then((response)=> {
             

                if(response.data.length == 0){
                    toast.error("No data found");
                    setLoadingCSV(false); 
                    return;
                }

                const riderDetails = response.data.jsonData;
                const csvData = riderDetails.map((item) => {
                    return {
                        "Rider ID": item?.riderId || "N/A",
                        "Rider Name": item?.riderName || "N/A",
                        "Mobile Number": item?.mobileNumber || "N/A",
                        "Status": item?.status || "N/A",
                        "Vehicle Type": item?.vehicleType || "N/A",
                        "Last Activity": item?.lastActivity || 0,
                        "Created Date": item?.createdDate || 0,
                        "Wallet Balance": item?.walletBalance || "N/A",
                        "Registration Fee Status": item?.registrationFeesPaid || "N/A",
                        "No of Orders Delivered": item?.noOfDeliveredOrders || "N/A",
                    };
                    
                });   
               
                
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(csvData);
        
                XLSX.utils.book_append_sheet(workbook, worksheet, "Rider_Detail");
        
                XLSX.writeFile(
                    workbook,
                    `Rider_Detail.xlsx`
                );
                
            })
        } catch (error) {
            console.error("Error exporting CSV:", error);
            toast.error("Failed to export data. Please try again.");
        } finally {
            setLoadingCSV(false); 
        }
    }

    const exportCsv = async () => {
        
        if (!startDate || !endDate) return;    
        const formattedFromDate = dayjs(startDate).format("MM-DD-YYYY");
        const formattedToDate = dayjs(endDate).format("MM-DD-YYYY");   
         
        try {
            const token = localStorage.getItem("jwtToken");
            setLoadingCSV(true);
            const response = await axiosInstance.get(
                `${BASE_URL}/order/v2/orders/get-city-wide-orders-by-date?from_date=${formattedFromDate}&to_date=${formattedToDate}`,
                {
                    responseType: "json",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
                
            );
    
            if (response.data?.length === 0) {
                alert("No data found for the specified date range.");
                setLoadingCSV(false); 
                return;
            }
            const csvData = response.data.map((item) => {
                const { orderDetails = {}, customerDetails = {}, riderDetails = {} } = item.jsonData || {};
                return {
                    "Order ID": orderDetails?.orderId || "N/A",
                    "Order Date": orderDetails?.orderDateTime || "N/A",
                    "User Mobile": orderDetails?.userMobileNumber || "N/A",
                    "User Name": orderDetails?.userName?.trim() || "N/A",
                    "Order Amount (MRP)": orderDetails?.orderAmount?.mrp || 0,
                    "Order Amount (Discount)": orderDetails?.orderAmount?.discount || 0,
                    "Order Amount (Final Price)": orderDetails?.orderAmount?.finalPrice || 0,
                    "Order Status": orderDetails?.orderStatus || "N/A",
                    "Delivery DateTime": orderDetails?.deliveryDateTime || "N/A",
                    "Pickup Address": customerDetails?.pickupAddress || "N/A",
                    "Delivery Address": customerDetails?.deliveryAddress || "N/A",
                    "Delivery Contact": customerDetails?.deliveryContact || "N/A",
                    "Rider ID": riderDetails?.riderId || "N/A",
                    "Rider Name": riderDetails?.riderName || "N/A",
                    "Rider Contact": riderDetails?.riderContact || "N/A",
                    "Vehicle Type": riderDetails?.vehicleType || "N/A",
                    "Rider Payout": riderDetails?.riderPayout || "N/A",
                };
                
            });   
            
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(csvData);
    
            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    
            XLSX.writeFile(
                workbook,
                `orders_${formattedFromDate}_to_${formattedToDate}.xlsx`
            );
            setStartDate(null);
            setEndDate(null)
        } catch (error) {
            console.error("Error exporting data:", error);
        }finally {
            setLoadingCSV(false);
        }
    };
    
    if (loading) {
        return <Loading />;
    }
  return (
    <>
        <ToastContainer/>
        <Card className="h-100">
            <Tabs>
                <div className="max-w-[800px] mx-auto">
                    <TabList>
                        <Tab>Logout From All Devices</Tab>
                        <Tab>Make All Rider Online</Tab>
                        <Tab>Export Data</Tab>
                    </TabList>
                </div>
                <TabPanel>
                    <div className="card-header md:flex justify-between items-center mb-4 px-0 py-2">
                        <div className="flex items-center">                            
                            <h4 className="card-title ms-2">Logout From All Devices</h4>
                        </div>
                    </div>
                    <div className="mx-auto shadow-base dark:shadow-none my-8 rounded-md overflow-x-auto">
                        <table className="w-full border-collapse dark:border-slate-700 dark:border">
                            <thead>
                                <tr>
                                    <th className="dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                                        <span className="block px-6 py-3 font-semibold">Sr. No</span>
                                    </th>
                                    <th className="dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                                        <span className="block px-6 py-3 font-semibold">First Name</span>
                                    </th>
                                    <th className="dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                                        <span className="block px-6 py-3 font-semibold">Mobile Number</span>
                                    </th>
                                    <th className="dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                                        <span className="block px-6 py-3 font-semibold">Email Id</span>
                                    </th>                                    
                                    <th className="dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                                        <span className="block px-6 py-3 font-semibold">Role</span>
                                    </th>
                                </tr>  
                            </thead> 
                            <tbody>
                                {logoutAll.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-4">No orders found.</td>
                                    </tr>
                                ) : (
                                    logoutAll.map((logout, index) => (
                                        <tr key={index}>
                                            <td className="table-td px-6 py-3">{index + 1}</td>
                                            <td className="table-td px-6 py-3">
                                                {logout.firstName}
                                            </td>
                                            <td className="table-td px-6 py-3">
                                                {logout.mobileNumber}                                                
                                            </td>   
                                            <td className="table-td px-6 py-3">{logout.email}</td>                                         
                                            <td className="table-td px-6 py-3">
                                                {logout.role}
                                            </td>
                                            
                                        </tr>
                                    ))
                                )}
                            </tbody>                      
                        </table>
                    </div>
                    <div className="text-end">
                        <Button type="button" className="btn btn-dark" onClick={() => logoutModal()}>Logout All Device</Button>
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="card-header md:flex justify-between items-center mb-3 px-0 py-1 ">
                        <div className="flex items-center">
                            <h4 className="card-title">Make All Rider Online</h4>
                        </div>
                    </div>
                    <p>By clicking on this button all registered riders in DB will be marked online, however after a defined time if there is no activity on the app by the rider he will automatically be marked offline again, according to the logic.</p>
                    <div className="text-end">
                        <Button type="button" className="btn btn-dark" onClick={() => allRidersOnline()}>Go Online</Button>
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="card-header md:flex justify-between items-center mb-4 px-0 py-2">
                        <div className="flex items-center">
                            <h4 className="card-title">Export Data</h4>
                        </div>
                    </div>
                    <div className="export-data">                        
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <div className="flex w-100 gap-3">
                                <div className="">
                                    <DatePicker
                                        label="Start Date"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        maxDate={dayjs()}
                                    />
                                </div>
                                <div className="">
                                    <DatePicker
                                        label="End Date"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                        maxDate={dayjs()}
                                    />
                                </div>
                                <button
                                    className={`btn btn-dark`}
                                    disabled={isButtonDisabled}
                                    onClick={exportCsv}
                                >   Export</button>
                            </div>
                           {loadingCSV && (
                             <div className="loader-fixed">
                                <span className="flex items-center gap-2">
                                    <Loading />                              
                                </span>
                             </div>
                           )}
                        </LocalizationProvider>                   
                    </div>
                    <div className="mt-4">
                        <p><strong>Note*</strong> <i>For every export,you can set the date limit to a maximum of 30 days.</i></p>
                    </div>
                    <div className="riderexport mt-3 pt-3 mb-3">
                        <div className="">
                            <div className="flex items-center">
                                <h4 className="card-title">Export Rider Detail</h4>
                            </div>
                        </div>
                        <button
                            className="btn btn-dark"
                            onClick={exportRiderCsv}
                        >   Export</button>
                    </div>
                </TabPanel>
            </Tabs>
        </Card>
            {isLogoutModal && 
                <Modal
                activeModal={isLogoutModal}
                uncontrol
                className="max-w-md"
                title=""
                
                onClose={() => setIsLogoutModal(false)}
                centered
            >
              <div className="">
                  <h5 className="text-center">Are you sure to logout all devices?</h5>
                  <div className="d-flex gap-2 justify-content-center mt-4">
                    <Button className="btn btn-dark" type="button" onClick={() => setIsLogoutModal(false)}>
                      No
                    </Button>
                    <Button className="btn btn-outline-light" type="button" onClick={() => {logoutAllDevice();setIsLogoutModal(false)}}>
                      Yes
                    </Button>
                  </div>
              </div>
            </Modal>
        }
    </>
  );
};

export default Settings;
