import React, { useEffect, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import Card from "../../components/ui/Card";
import { BASE_URL } from "../../api";
import Loading from "../../components/Loading";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../api";

const Vehicle_Settings = () => {
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
    
    
    if (loading) {
        return <Loading />;
    }
  return (
    <>
        <Card className="h-100">
            <div className="card-header md:flex justify-between items-center mb-4 px-0 py-2">
                <div className="flex items-center">                            
                    <h4 className="card-title ms-2">Vehicle Settings</h4>
                </div>
            </div>
        </Card>
    </>
  );
};

export default Vehicle_Settings;
