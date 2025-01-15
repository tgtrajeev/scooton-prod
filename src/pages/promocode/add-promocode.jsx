import React, { useState } from "react";
import axios from "axios";
import Card from "../../components/ui/Card";
import Textinput from "../../components/ui/Textinput";
import Button from "../../components/ui/Button";
import Switch from "../../components/ui/Switch";
import { BASE_URL } from "../../api";
import { format, parseISO } from "date-fns";
import Swicth from "../../components/ui/Switch";
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddPromoImg from "../../assets/images/Promo-code-img.png";
import axiosInstance from "../../api";
import { useNavigate } from "react-router-dom";


const promocodeType = ["FIXED", "PERCENTAGE"];

const AddPromocode = () => {

  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    promoCode: "",
    amount: "",
    promoCodeType: promocodeType[0],
    publicShown: false,
    active: true,
    startDate: "",
    expireDate: ""
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (type === "datetime-local") {
      const formattedDate = value.replace("T", " ");
      setFormData({
        ...formData,
        [id]: formattedDate
      });
    } else if (id === "publicShown") {
      setFormData({
        ...formData,
        publicShown: checked
      });
    } else {
      setFormData({
        ...formData,
        [id]: value
      });
    }
  };
  const handleInputChangepublicShown = (e) => {
    const { value,checked } = e.target;
    setFormData(prevDetails => ({
        ...prevDetails,
        publicShown: checked
    }));
  };

  const handleSubmit = async (e) => {
    debugger
    e.preventDefault();
    if (!formData.promoCode && !formData.amount  && !formData.startDate && !formData.expireDate) {
          toast.error("All fields are required");
          return;
    }

      const token = localStorage.getItem("jwtToken");
      if(token){
      const formattedData = {
        ...formData,
        startDate: format(parseISO(formData.startDate), "dd-MM-yyyy HH:mm:ss"),
        expireDate: format(parseISO(formData.expireDate), "dd-MM-yyyy HH:mm:ss")
      };
      
      const response = await axiosInstance.post(`${BASE_URL}/promo-code/add`, formattedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((response) => {
          toast.success("Promocode added successfully!");
          setTimeout(() => {
            navigate('/promocode-list')
          }, 500);
          setFormData({
            promoCode: '',
            amount: '',
            promoCodeType: promocodeType[0],  
            publicShown: false,
            startDate: '',
            expireDate: ''
          })
        })
        .catch((error) => {
          const errorMessage = error.response.data.error.match(/\[(.*?)\]/);
          console.log(error)
             toast.error(errorMessage[1]);
        })
      
    } else((error) => {
      console.error("No token found");
    })
      
  
    debugger
  };

  return (
    <>
      <ToastContainer />
      <Card title="Add Promocode" className="mb-0">       
        <form className="" onSubmit={handleSubmit}>
          <div className="grid xl:grid-cols-2 md:grid-cols-2 grid-cols-1">
              <div className="m-auto">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label mb-1">Promo Code*</label>
                    <input
                      id="promoCode"
                      type="text"
                      className="form-control"
                      value={formData.promoCode}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-4">
                    <label className="form-label mb-1">Discount</label>
                    <input
                      id="amount"
                      type="text"
                      className="form-control"
                      value={formData.amount}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-12 mb-4">
                    <label htmlFor="promoCodeType" className="form-label mb-1">Select Promocode Type</label>
                    <select
                      className="form-control py-2 form-select h-50"
                      id="promoCodeType"
                      value={formData.promoCodeType}
                      onChange={handleChange}
                    >
                      {promocodeType.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>                
                  <div className="col-md-6 mb-4">
                    <label className="form-label mb-1">Start Date</label>
                    <input
                      id="startDate"
                      type="datetime-local"
                      className="form-control"
                      value={formData.startDate}
                      onChange={handleChange}
                    />                  
                  </div>
                  <div className="col-md-6 mb-4">
                      <label className="form-label mb-1">Expiry Date</label>
                      <input
                        id="expireDate"
                        type="datetime-local"
                        className="form-control"
                        value={formData.expireDate}
                        onChange={handleChange}
                      />
                  </div>
                  <div>
                    <div className="form-check form-switch ps-0">
                        <label className="form-label mb-1">Public Shown</label>
                        <input
                          className="form-check-input ms-0"
                          type="checkbox"
                          role="switch"
                          id={formData.publicShown}
                          checked={formData.publicShown}
                          onChange={handleInputChangepublicShown}
                        />
                    </div>
                  </div>
                  <div className="space-y-4 text-end">
                    <Button text="Submit" className="btn-dark" type="submit" />
                  </div>
                </div>
              </div>
            <div className="m-auto">
              <img src={AddPromoImg} alt="Promocode" width={450} />
            </div>
          </div>
          
        </form>
      </Card>
    </>
  );
};

export default AddPromocode;
