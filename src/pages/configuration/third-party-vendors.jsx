import React, { useEffect, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import Card from "../../components/ui/Card";
import { BASE_URL } from "../../api";
import Loading from "../../components/Loading";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../api";

const Third_Party_Vendors = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setLoading(false);
    }, []);
    
    
    if (loading) {
        return <Loading />;
    }
  return (
    <>
        <Card className="h-100">
            <div className="card-header md:flex justify-between items-center mb-4 px-0 py-2">
                <div className="flex items-center">                            
                    <h4 className="card-title ms-2">Third Party Vendors</h4>
                </div>
            </div>
        </Card>
    </>
  );
};

export default Third_Party_Vendors;
