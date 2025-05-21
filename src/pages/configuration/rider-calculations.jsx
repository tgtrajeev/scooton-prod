import React, { useEffect, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import Card from "../../components/ui/Card";
import { BASE_URL } from "../../api";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { TabPanel, Tabs, Tab, TabList } from "react-tabs";
import axiosInstance from "../../api";

const Rider_Calculations = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

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
    
    if (loading) {
        return <Loading />;
    }
  return (
    <>
        <Card className="h-100">
            <Tabs>
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
            </Tabs>
        </Card>
    </>
  );
};

export default Rider_Calculations;
