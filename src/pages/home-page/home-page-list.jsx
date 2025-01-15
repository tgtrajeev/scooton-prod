import React, { useEffect, useState } from "react";
import 'react-tabs/style/react-tabs.css';
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import { Icon } from "@iconify/react/dist/iconify.js";
import { BASE_URL } from "../../api";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import axiosInstance from "../../api";


const HomepageList = () => {
    const[homepageList, setHomepageList] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const fetchhomepagelist = async () => {
        try {
          const token = localStorage.getItem('jwtToken');
          if (token) {
            const response = await axiosInstance.get(`${BASE_URL}/home/get-all-homepage-details`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            setHomepageList(response.data);
          }
        } catch (error) {
          console.error('Error fetching order detail:', error);
        } finally {
            setLoading(false);
        }
      };  
      fetchhomepagelist();
    }, []);

    if (loading) {
        return <Loading />;
    }
  return (
    <Card>
        <div className="card-header md:flex justify-between items-center mb-5 px-0">
            <div className="flex items-center">
                <Link to="/">
                    <Icon icon="heroicons:arrow-left-circle" className="text-xl font-bold text-scooton-500" />
                </Link>
                <h4 className="card-title ms-2">Homepage List </h4>
            </div>
        </div>
        <div className="mx-auto shadow-base dark:shadow-none my-8 rounded-md overflow-x-auto">
            <table className="w-full border-collapse table-fixed dark:border-slate-700 dark:border">
                <thead>
                    <tr>
                        <th className="bg-slate-50 dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                            <span className="block px-6 py-5 font-semibold">Sr. No</span>
                        </th>
                        <th className="bg-slate-50 dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                            <span className="block px-6 py-5 font-semibold">Id</span>
                        </th>
                        <th className="bg-slate-50 dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                            <span className="block px-6 py-5 font-semibold">Banner</span>
                        </th>
                        <th className="bg-slate-50 dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                            <span className="block px-6 py-5 font-semibold">Pincode</span>
                        </th>                                    
                        <th className="bg-slate-50 dark:bg-slate-700 dark:text-slate-300 text-xs text-left font-medium leading-4 uppercase text-slate-600">
                            <span className="block px-6 py-5 font-semibold">Status</span>
                        </th>
                    </tr>  
                </thead> 
                <tbody>
                    {homepageList.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center p-4">No orders found.</td>
                        </tr>
                    ) : (
                        homepageList.map((homepage, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4">
                                    {homepage.homepageId}
                                </td>
                                <td className="px-6 py-4">
                                    {homepage.catalogName}                                                
                                </td>   
                                <td className="px-6 py-4" style={{ wordBreak: 'break-all'}}>{homepage.pinCode}</td>                                         
                                <td className="px-6 py-4">
                                    <Button text="button" className="btn-dark">
                                        <Icon icon="heroicons:pencil-square" className="text-[20px]"></Icon>
                                    </Button>
                                </td>
                                
                            </tr>
                        ))
                    )}
                </tbody>                      
            </table>
        </div>
    </Card>
  );
};

export default HomepageList;
