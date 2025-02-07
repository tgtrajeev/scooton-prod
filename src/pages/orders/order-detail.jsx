import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import { Icon } from "@iconify/react/dist/iconify.js";
import { BASE_URL } from "../../api";
import Loading from "../../components/Loading";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../api";

const OrderDetail = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPickupModal, setisPickupModal] = useState(false);
    const [isDeliveryModal, setisdeliveryModal] = useState(false);
    const [isLoadingInvoice, setisLoadingInvoice] = useState(false);
    const [pickup, setPickup] = useState(false);
    const [delivered, setDelivered] = useState(false);

    const openPickupModal = async () => {
        setisPickupModal(true);
    }
    const openDeliveryModal = async () => {
        setisdeliveryModal(true);
    }

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                if (token) {
                    const response = await axiosInstance.get(`${BASE_URL}/order/v2/orders/get-city-wide-order/${orderId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setOrderDetail(response.data.jsonData);
                }
            } catch (error) {
                console.error('Error fetching order detail:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId, pickup, delivered]);

    if (loading) {
        return <Loading />;
    }

    if (!orderDetail) {
        return <div>Order not found.</div>;
    }

    const {
        orderDetails,
        customerDetails,
        packageDetails,
        cancelDetails,
        riderDetails,
        vehiceDetails,
        tripDetails
    } = orderDetail;

    const handlePickupConfirm = async (payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/rider/pickup-delivery-otp-verification-admin/`,
                payload
            );
            if (response.data.message === "Success") {
                setisPickupModal(false);
                setPickup(true);
                toast.success('Pickup confirmed successfully!');
            } else {
                toast.error('Failed to confirm pickup: ' + response.data.message);
            }
        } catch (error) {
            toast.error('An error occurred while confirming pickup. Please try again.');
        }
    };
    const handleDeliveryConfirm = async (payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/rider/pickup-delivery-otp-verification-admin/`,
                payload
            );
            if (response.data.message === "Success") {
                toast.success('Delivery confirmed successfully!');
                setDelivered(true);
                setisdeliveryModal(false);
            } else {
                toast.error('Failed to confirm pickup: ' + response.data.message);
            }
        } catch (error) {
            toast.error('An error occurred while confirming pickup. Please try again.');
        }
    };
    const downloadInvoice = async () => {
        
        setisLoadingInvoice(true);
        try {
            
            const response = await axiosInstance.post(
                `${BASE_URL}/order/orders/admin/getInvoice/${orderId}`,
                {} ,
                { responseType: 'blob' }
            );
            if (response.data) {
                const url = window.URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Invoice_${orderId}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success('Invoice Download successfully!');
                
            } else {
                toast.error('Failed to failed to download: ' + response.data.message);
            }
        } catch (error) {
            toast.error('An error occurred while downloading invoice. Please try again.');
        } finally {
            setLoading(false);
            setisLoadingInvoice(false);
        };
        
    };

    return (
        <Card>
            <ToastContainer />
            <div className="order-header">
                <div className="md:flex justify-between items-center mb-4 border-bottom">
                    <div className="flex items-center mb-2">
                        <Link to="/all-orders">
                            <Icon icon="heroicons:arrow-left-circle" className="text-xl font-bold text-scooton-500" />
                        </Link>
                        <h4 className="card-title ms-2 mb-0">Order Details</h4>
                    </div>
                    <div className="mb-2 d-flex gap-4">
                        <img src={vehiceDetails.imageUrl} alt={vehiceDetails.vehicleType} width={40} />
                        {orderDetails.orderStatus === 'Delivered' && (
                            <button type="button" className="btn btn-sm btn-dark py-1 px-2" onClick={downloadInvoice}>Get Invoice</button>
                        )}
                        {isLoadingInvoice && (
                            <div className="loader-fixed">
                                <span className="flex items-center gap-2">
                                    <Loading />
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="multistep-prgressbar">
                    <ul>
                        {/* <li className={`multistep-list ${orderDetails.orderStatus === 'In Progress'
                            || orderDetails.orderStatus === 'In Transit'
                            || orderDetails.orderStatus === 'Delivered' ? 'active' : ''}`}>
                            <span>{orderDetails.orderDateTime}</span>
                            <div className="multistep-item">Order Placed hyg</div>
                        </li> */}
                        <li className="multistep-list active">
                            <span>{orderDetails.orderDateTime}</span>
                            <div className="multistep-item">Order Placed</div>
                        </li>
                        
                        {tripDetails?.orderAccepted && (
                             <li className={`multistep-list  ${tripDetails?.orderAccepted ? 'active' : ''}`}>
                                {tripDetails?.orderAcceptedTimeTaken && (
                                    <span className="orderTimetaken">{tripDetails?.orderAcceptedTimeTaken || ' '}</span>
                                )}
                                <span>{tripDetails?.orderAcceptedDateTime || ' '}</span>
                                <div className="multistep-item">Accepted</div>
                             </li>
                        )}
                        {(!tripDetails?.orderAccepted && orderDetails.orderStatus !== 'Cancelled') && (
                            <li className={`multistep-list  ${tripDetails?.orderAccepted ? 'active' : ''}`}>
                                {tripDetails?.orderAcceptedTimeTaken && (
                                    <span className="orderTimetaken">{tripDetails?.orderAcceptedTimeTaken || ' '}</span>
                                )}
                                <span>{tripDetails?.orderAcceptedDateTime || ' '}</span>
                                <div className="multistep-item">Accepted</div>
                            </li>
                        )}
                        {tripDetails?.orderInTransit === true && (
                            <li className={`multistep-list ${tripDetails?.orderInTransit ? 'active' : ''}`}>
                                {tripDetails?.orderInTransitTimeTaken && (
                                    <span className="orderTimetaken">{tripDetails?.orderInTransitTimeTaken || ' '}</span>
                                )}
                                <span>{tripDetails?.orderInTransitDateTime || ' '}</span>
                                <div className="multistep-item" onClick={() => {
                                    if (!tripDetails?.orderInTransit) {
                                        openPickupModal();
                                    }
                                }}> Pickup 
                                </div>
                                {isPickupModal && (
                                    <Modal
                                        activeModal={isPickupModal}
                                        uncontrol
                                        className="max-w-md"
                                        title=""
                                        centered
                                        onClose={() => setisPickupModal(false)}
                                    >
                                        <div className="">
                                            <h5 className="text-center">Pickup Service</h5>
                                            <p className="text-center my-3">Confirm Pickup Order</p>
                                            <div className="d-flex gap-2 justify-content-center mt-4">
                                                <Button className="btn btn-dark" type="button" onClick={() => setisPickupModal(false)}>
                                                    No
                                                </Button>
                                                <Button className="btn btn-outline-light" type="button"
                                                    onClick={() => handlePickupConfirm({
                                                        orderId: orderId,
                                                        orderType: "CITYWIDE",
                                                        otp: "0000"
                                                    })}
                                                >
                                                    Yes
                                                </Button>
                                            </div>
                                        </div>
                                    </Modal>
                                )}
                            </li>
                        )}
                        {(!tripDetails?.orderInTransit && orderDetails.orderStatus !== 'Cancelled')  && (
                            <li className={`multistep-list ${tripDetails?.orderInTransit ? 'active' : ''}`}>
                                {tripDetails?.orderInTransitTimeTaken && (
                                    <span className="orderTimetaken">{tripDetails?.orderInTransitTimeTaken || ' '}</span>
                                )}
                                <span>{tripDetails?.orderInTransitDateTime || ' '}</span>
                                <div className="multistep-item" onClick={() => {
                                    if (!tripDetails?.orderInTransit) {
                                        openPickupModal();
                                    }
                                }}> Pickup 
                                </div>
                                {isPickupModal && (
                                    <Modal
                                        activeModal={isPickupModal}
                                        uncontrol
                                        className="max-w-md"
                                        title=""
                                        centered
                                        onClose={() => setisPickupModal(false)}
                                    >
                                        <div className="">
                                            <h5 className="text-center">Pickup Service</h5>
                                            <p className="text-center my-3">Confirm Pickup Order</p>
                                            <div className="d-flex gap-2 justify-content-center mt-4">
                                                <Button className="btn btn-dark" type="button" onClick={() => setisPickupModal(false)}>
                                                    No
                                                </Button>
                                                <Button className="btn btn-outline-light" type="button"
                                                    onClick={() => handlePickupConfirm({
                                                        orderId: orderId,
                                                        orderType: "CITYWIDE",
                                                        otp: "0000"
                                                    })}
                                                >
                                                    Yes
                                                </Button>
                                            </div>
                                        </div>
                                    </Modal>
                                )}
                            </li>
                        )}
                        {tripDetails?.orderDelivered && (
                           <li className={`multistep-list ${tripDetails?.orderDelivered ? 'active' : ''}`}>
                                {tripDetails?.orderDeliveredTimeTaken && (
                                   <span className="orderTimetaken">{tripDetails?.orderDeliveredTimeTaken || ' '}</span>
                                )}
                                <span>{tripDetails?.orderDeliveredDateTime || ' '}</span>
                                <div className="multistep-item"
                                    onClick={() => {
                                        if (!tripDetails?.orderDelivered) {
                                            openDeliveryModal();
                                        }
                                    }}
                                > Delivered
                                </div>
                                {isDeliveryModal && (
                                    <Modal
                                        activeModal={isDeliveryModal}
                                        uncontrol
                                        className="max-w-md"
                                        title=""
                                        centered
                                        onClose={() => setisdeliveryModal(false)}
                                    >
                                        <div className="">
                                            <h5 className="text-center">Delivery Service</h5>
                                            <p className="text-center my-3">Confirm Delivery Order</p>
                                            <div className="d-flex gap-2 justify-content-center mt-4">
                                                <Button className="btn btn-dark" type="button" onClick={() => setisdeliveryModal(false)}>
                                                    No
                                                </Button>
                                                <Button className="btn btn-outline-light" type="button"
                                                    onClick={() => handleDeliveryConfirm({
                                                        orderId: orderId,
                                                        orderType: "CITYWIDE",
                                                        otp: "0000"
                                                    })}
                                                >
                                                    Yes
                                                </Button>
                                            </div>
                                        </div>
                                    </Modal>
                                )}
                            </li>
                        )}
                        {(!tripDetails?.orderDelivered && orderDetails.orderStatus !== 'Cancelled') && (
                           <li className={`multistep-list ${tripDetails?.orderDelivered ? 'active' : ''}`}>
                                {tripDetails?.orderDeliveredTimeTaken && (
                                   <span className="orderTimetaken">{tripDetails?.orderDeliveredTimeTaken || ' '}</span>
                                )}
                                <span>{tripDetails?.orderDeliveredDateTime || ' '}</span>
                                <div className="multistep-item"
                                    onClick={() => {
                                        if (!tripDetails?.orderDelivered) {
                                            openDeliveryModal();
                                        }
                                    }}
                                > Delivered
                                </div>
                                {isDeliveryModal && (
                                    <Modal
                                        activeModal={isDeliveryModal}
                                        uncontrol
                                        className="max-w-md"
                                        title=""
                                        centered
                                        onClose={() => setisdeliveryModal(false)}
                                    >
                                        <div className="">
                                            <h5 className="text-center">Delivery Service</h5>
                                            <p className="text-center my-3">Confirm Delivery Order</p>
                                            <div className="d-flex gap-2 justify-content-center mt-4">
                                                <Button className="btn btn-dark" type="button" onClick={() => setisdeliveryModal(false)}>
                                                    No
                                                </Button>
                                                <Button className="btn btn-outline-light" type="button"
                                                    onClick={() => handleDeliveryConfirm({
                                                        orderId: orderId,
                                                        orderType: "CITYWIDE",
                                                        otp: "0000"
                                                    })}
                                                >
                                                    Yes
                                                </Button>
                                            </div>
                                        </div>
                                    </Modal>
                                )}
                            </li>
                        )}
                       
                        {orderDetails.orderStatus === 'Cancelled' && (
                            <li className={`multistep-list ${orderDetails.orderStatus === 'Cancelled'? 'active' : ''}`}>
                                 {cancelDetails?.orderCancelledTimeTaken && (
                                    <span className="orderTimetaken">{cancelDetails?.orderCancelledTimeTaken || ' '}</span>
                                )}
                                <span>{cancelDetails.orderCancelledDateTime}</span>
                                <div className="multistep-item">Cancel</div>
                            </li>
                        )}
                        
                    </ul>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-6">
                    <div className="mx-auto shadow-base dark:shadow-none my-8 rounded-md overflow-x-auto">
                        <h6 className="text-scooton-500 p-3 border-bottom">Order Info</h6>
                        <table className="w-full border-collapse table-fixed dark:border-slate-700 dark:border">
                            <tbody>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="text-slate-900 dark:text-slate-300 text-sm  font-normal ltr:text-left ltr:last:text-right rtl:text-right rtl:last:text-left px-6 py-2">
                                        Order Id
                                    </td>
                                    <td className="text-slate-900 dark:text-slate-300 text-sm  font-normal ltr:text-left ltr:last:text-right rtl:text-right rtl:last:text-left px-6 py-2">
                                        {orderDetails.order_Id}
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="text-slate-900 dark:text-slate-300 text-sm  font-normal ltr:text-left ltr:last:text-right rtl:text-right rtl:last:text-left px-6 py-2">
                                        Order Date
                                    </td>
                                    <td className="text-slate-900 dark:text-slate-300 text-sm  font-normal ltr:text-left ltr:last:text-right rtl:text-right rtl:last:text-left px-6 py-2">
                                        {orderDetails.orderDateTime}
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Order Status </td>
                                    <td className=" px-6 py-2 text-end">{orderDetails.orderStatus}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Order Type </td>
                                    <td className=" px-6 py-2 text-end">{orderDetails.orderType}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Pickup Address </td>
                                    <td className=" px-6 py-2 text-end">{customerDetails.pickupAddress}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Pickup Contact </td>
                                    <td className=" px-6 py-2 text-end">{customerDetails.pickupContact}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Delivery Address </td>
                                    <td className=" px-6 py-2 text-end">{customerDetails.deliveryAddress},{customerDetails.deliveryAddress1},{customerDetails.deliveryPinCode}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Delivery Contact </td>
                                    <td className=" px-6 py-2 text-end">{customerDetails.deliveryContact}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Distance (KM) </td>
                                    <td className=" px-6 py-2 text-end">{orderDetails.distance}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Instruction </td>
                                    <td className=" px-6 py-2 text-end">{orderDetails.instructionText}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Type Of Package </td>
                                    <td className=" px-6 py-2 text-end">{packageDetails.packageType}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Package Weight</td>
                                    <td className=" px-6 py-2 text-end">{packageDetails.packageWeight}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Package Value</td>
                                    <td className=" px-6 py-2 text-end">{packageDetails.packageValue}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className=" px-6 py-2"> Package Type</td>
                                    <td className=" px-6 py-2 text-end">{packageDetails.isFragile}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="mx-auto shadow-base dark:shadow-none my-8 rounded-md overflow-x-auto">
                        <h6 className="text-scooton-500 p-3 border-bottom">Rider Info</h6>
                        <table className="w-full border-collapse table-fixed dark:border-slate-700 dark:border">
                            <tbody>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2"> Rider Name </td>
                                    <td className="text-end px-6 py-2">
                                        {/* {riderDetails.riderName} */}
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">Rider Number</td>
                                    {/* <td className="text-end px-6 py-4"> {riderDetails.riderContact}</td> */}
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">Rider Vehicle Number</td>
                                    {/* <td className="text-end px-6 py-4"> {riderDetails.riderVehicleNumber}</td> */}
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">Vehicle Type</td>
                                    <td className="text-end px-6 py-2"> {vehiceDetails.vehicleType}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mx-auto shadow-base dark:shadow-none my-8 rounded-md overflow-x-auto">
                        <h6 className="text-scooton-500 p-3 border-bottom">Payment Detail</h6>
                        <table className="w-full border-collapse table-fixed dark:border-slate-700 dark:border">
                            <tbody>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">Payment Mode</td>
                                    <td className="text-end px-6 py-2">{orderDetails.paymentMode}</td>
                                </tr>
                                {(orderDetails.orderStatus === 'Delivered' && orderDetails.paymentMode !== 'PREPAID')  && (
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <td className="px-6 py-2">Payment Status</td>
                                        <td className="text-end px-6 py-2">COMPLETED</td>
                                    </tr>
                                )}
                                {(orderDetails.orderStatus !== 'Delivered' && orderDetails.paymentMode !== 'PREPAID') && (
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <td className="px-6 py-2">Payment Status</td>
                                        <td className="text-end px-6 py-2">PENDING</td>
                                    </tr>
                                )}
                                {orderDetails.paymentMode === 'PREPAID' && (
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <td className="px-6 py-2">Refund Message</td>
                                        <td className="text-end px-6 py-2">{orderDetails.refundStatus}</td>
                                    </tr>
                                )}
                                
                                {orderDetails.paymentMode === 'PREPAID' && (
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <td className="px-6 py-2">Payment Status</td>
                                        <td className="text-end px-6 py-2">{orderDetails.paymentStatus}</td>
                                    </tr>
                                )}
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">MRP</td>
                                    <td className="text-end px-6 py-2">{orderDetails.orderAmount.mrp}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">Discount</td>
                                    <td className="text-end px-6 py-2">{orderDetails.orderAmount.discount}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">MCD Tax</td>
                                    <td className="text-end px-6 py-2">{orderDetails.orderAmount.mcdTax.toFixed(3)}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">State Tax</td>
                                    <td className="text-end px-6 py-2">{orderDetails.orderAmount.stateTax.toFixed(3)}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">Toll Tax</td>
                                    <td className="text-end px-6 py-2">{orderDetails.orderAmount.tollTax.toFixed(3)}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">Applied Promocode</td>
                                    <td className="text-end px-6 py-2">{orderDetails.orderAmount.promoCode}</td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="px-6 py-2">Total Amount Payable</td>
                                    <td className="text-end px-6 py-2">{orderDetails.orderAmount.finalPrice}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            
        </Card>
    );
};

export default OrderDetail;
