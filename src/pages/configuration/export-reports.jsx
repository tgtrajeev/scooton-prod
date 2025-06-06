import React, { useEffect, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import { Icon } from "@iconify/react/dist/iconify.js";
import { BASE_URL } from "../../api";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { toast, ToastContainer } from "react-toastify";
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

const Export_Reports = () => {
    const navigate = useNavigate();
    const [logoutAll, setLogoutAllList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logoutDevice, setLogoutDevice] = useState();
    const [isLogoutModal, setIsLogoutModal] = useState(false);
    const [selectedFields, setSelectedFields] = useState([]);

    // Define the state for orderType
    const [orderType, setOrderType] = useState("CITYWIDE"); // Default to "CITYWIDE"

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

    const handleCheckboxChange = (e) => {
        const { id, checked } = e.target;

        setSelectedFields((prev) =>
            checked ? [...prev, id] : prev.filter((item) => item !== id)
        );
    };

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
            setIsButtonDisabled(differenceInDays > 31 || differenceInDays <= 0);
        } else {
            setIsButtonDisabled(true);
        }
    };

    const exportRiderCsv = async () => {
        try {
            setLoadingCSV(true);
            await axiosInstance.get(`${BASE_URL}/order/admin/registered-rider-details`).then((response) => {

                if (response.data.length == 0) {
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
                        "On role riders": item?.onRoleRider || "N/A",
                        "Last activity": item?.lastActivity || "N/A",
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

    const exportRegRiderFilter = async () => {
        const baseFields = [
            "riderId",
            "riderName",
            "riderMobileNumber",
            "walletBalance",
        ];

        const allFields = [...new Set([...baseFields, ...selectedFields])];

        const fieldMap = {
            riderId: "Rider ID",
            riderName: "Rider Name",
            riderMobileNumber: "Mobile Number",
            riderCity: "City",
            status: "Status",
            vehicleType: "Vehicle Type",
            walletBalance: "Wallet Balance",
            onRoleRider: "On role riders",
            lastActivity: "Last activity",
        };

        const params = new URLSearchParams();
        allFields.forEach(field => params.append('fields', field));

        try {
            setLoadingCSV(true);

            const response = await axiosInstance.get(
                `${BASE_URL}/api/v1/admin/report/registered-rider-details-filtered?${params.toString()}`
            )
                .then((response) => {

                    if (response.data.length == 0) {
                        toast.error("No data found");
                        setLoadingCSV(false);
                        return;
                    }

                    const riderDetails = response.data.jsonData;
                    const csvData = riderDetails.map(item => {
                        const row = {};
                        allFields.forEach(field => {
                            const header = fieldMap[field];
                            row[header] = item?.[field] ?? "N/A";
                        });
                        return row;
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
    const formattedFromDate = dayjs(startDate).format("YYYY-MM-DD");
    const formattedToDate = dayjs(endDate).format("YYYY-MM-DD");

    try {
        const token = localStorage.getItem("jwtToken");
        setLoadingCSV(true);

        const response = await axiosInstance.get(
        `${BASE_URL}/api/v1/admin/report/get-reports?from_date=${formattedFromDate}&to_date=${formattedToDate}&order_type=${orderType}&vendor_name=SHIPROCKET`,
        {
            responseType: "json",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        // Check if data is present and non-empty
        const reportData = response.data?.jsonData || [];
        if (reportData.length === 0) {
        alert("No data found for the specified date range.");
        setLoadingCSV(false);
        return;
        }

        // Map the data for CSV export
        const csvData = reportData.map((item) => ({
        "Order ID": item.orderId || "N/A",
        "Order Date": item.orderDate || "N/A",
        "User Mobile": item.mobileNumber || "N/A",
        "User Name": (item.userName && item.userName.trim() !== "null") ? item.userName.trim() : "N/A",
        "Fare Amount": item.mrp || 0,
        "Discount": item.discount || 0,
        "Toll tax": item.tollTax || 0,
        "MCD tax": item.mcdTax || 0,
        "State tax": item.stateTax || 0,
        "Collective Amount": item.freightAmount || 0,
        "Order Status": item.orderStatus || "N/A",
        "Delivery DateTime": item.deliveryDateTime || "N/A",
        "Pickup Address": item.pickupAddress || "N/A",
        "Delivery Address": item.deliveryAddress || "N/A",
        "Delivery Contact": item.deliveryContact || "N/A",
        "Rider ID": item.riderId || "N/A",
        "Rider Name": item.riderName || "N/A",
        "Rider Contact": item.riderPhone || "N/A",
        "Vehicle Type": item.vehicleType || "N/A",
        "Rider Payout": item.riderPayout || 0,
        }));

        // Create Excel file
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(csvData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        XLSX.writeFile(
        workbook,
        `orders_${orderType}_${formattedFromDate}_to_${formattedToDate}.xlsx`
        );

        setStartDate(null);
        setEndDate(null);
    } catch (error) {
        console.error("Error exporting data:", error);
    } finally {
        setLoadingCSV(false);
    }
    };



    if (loading) {
        return <Loading />;
    }
    return (
        <>
            <Card className="h-100">
                <div className="card-header md:flex justify-between items-center mb-4 px-0 py-2">
                    <div className="flex items-center">
                        <h4 className="card-title">Export Order Data</h4>
                    </div>
                </div>
                <div className="export-data mb-4">
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
                            
                            <div class="flex items-center">
                                <input id="CITYWIDE" type="radio" name="orderType" value="CITYWIDE" checked={orderType === "CITYWIDE"} onChange={() => setOrderType("CITYWIDE")} className="form-check-input"/>
                                <label for="CITYWIDE" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Citywide</label>
                            </div>
                            <div class="flex items-center">
                                <input id="THIRDPARTY" type="radio" name="orderType" value="THIRDPARTY" checked={orderType === "THIRDPARTY"} onChange={() => setOrderType("THIRDPARTY")} className="form-check-input"/>
                                <label for="THIRDPARTY" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Shiprocket</label>
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
                <hr></hr>
                <div className="mt-3">
                    <p className="mb-2"><strong>Note*</strong></p>
                    <ol className="list-decimal ms-3">
                        <li>For every export, you can set the date limit to a maximum of 31 days.</li>
                        <li>On Citywide selection, you will get all orders.</li>
                        <li>On Shiprocket selection, you will get all orders, except cancelled & which are not rider assinged.</li>
                    </ol>
                </div>
            </Card>

            <Card className="h-100 mt-3">
                <div className="card-header md:flex justify-between items-center mb-4 px-0 py-2">
                    <div className="flex items-center">
                        <h4 className="card-title">Export Rider Detail</h4>
                    </div>
                </div>
                <div className="export-data flex space-x-4">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="riderCity" onChange={handleCheckboxChange} />
                        <label class="form-check-label" for="riderCity">
                            Rider City
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="vehicleType" onChange={handleCheckboxChange} />
                        <label class="form-check-label" for="vehicleType">
                            Vehicle Type
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="status" onChange={handleCheckboxChange} />
                        <label class="form-check-label" for="status">
                            Status
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="onRoleRider" onChange={handleCheckboxChange} />
                        <label class="form-check-label" for="onRoleRider">
                            On role riders
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="lastActivity" onChange={handleCheckboxChange} />
                        <label class="form-check-label" for="lastActivity">
                            Last activity
                        </label>
                    </div>

                </div>

                <div className="mt-3 pt-3 mb-3">
                    <button
                        className="btn btn-dark"
                        onClick={exportRegRiderFilter}
                    >   Export</button>
                </div>
                <hr></hr>
                <div className="mt-3">
                    <p className="mb-2"><strong>Note*</strong></p>
                    <ol className="list-decimal ms-3">
                        <li>By default you will get Rider Id, Rider Name, Rider Mobile No., WalletBalance.</li>
                        <li>Select checkbox for adding column in the export report. </li>
                        <li>In this export you will get only register riders which has done at least one order wheather it's cancelled.</li>
                    </ol>
                </div>
            </Card>
        </>
    );
};

export default Export_Reports;
