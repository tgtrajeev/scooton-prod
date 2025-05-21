import React, { useEffect, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import Card from "../../components/ui/Card";
import { BASE_URL } from "../../api";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../components/ui/Modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api";

const Logout_from_all_devices = () => {
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

    
    if (loading) {
        return <Loading />;
    }
  return (
    <>
        <Card className="h-100">
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

export default Logout_from_all_devices;
