import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../../api";
import { useNavigate } from "react-router-dom";
import AddRoleImg from "../../assets/images/Add-Role.png";
import axiosInstance from "../../api";

const AddRole = () => {
  const serviceAreaId = localStorage.getItem("serviceAreaId");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    password: "",
    role: "",
    email: "",
    service_id: null,
  });
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      axiosInstance
        .get(`${BASE_URL}/register/get-all-roles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const roles = response.data.map((role) => {
            let label;
            switch (role) {
              case "ROLE_SUPER_ADMIN":
                label = "Super Admin";
                break;
              case "ROLE_CITY_ADMIN":
                label = "Admin";
                break;
              case "ROLE_EDITOR":
                label = "Viewer";
                break;
              default:
                label = role;
            }
            return { value: role, label };
          });
          setRoleOptions(roles);
        })
        .catch((error) => {
          console.error("Error fetching roles:", error);
        });
    } else {
      console.error("No token found");
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName && !formData.lastName && !formData.role && !formData.email && !formData.mobileNumber && !formData.password) {
      toast.error("All fields are required");
      return;
    }
    
    const token = localStorage.getItem("jwtToken");
    if (token) {
      axiosInstance
        .post(`${BASE_URL}/register/admin/add`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          toast.success("Role added successfully!");
          setTimeout(() => {
            navigate('/role-list')
          }, 500);
          setFormData({
            firstName: "",
            lastName: "",
            mobileNumber: "",
            password: "",
            role: "",
            email: "",
            service_id: null,
          })
        })
        .catch((error) => {
          //toast.error("Error adding role. Please try again.");
          if (error.response && error.response.status === 401) {
            navigate("/");
            toast.error("Unauthorized. Please log in again.");
          } else {
           // toast.error("Error adding role. Please try again.");
            toast.error(error.response.data.error);
          }
        });
    } else {
      console.error("No token found");
    }
  };

  return (
    <>
      <ToastContainer />
      <Card title="Add New Role" className="mb-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid xl:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5">
            <div className="m-auto">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label mb-1">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label mb-1">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label mb-1">Mobile Number</label>
                  <input
                    id="mobileNumber"
                    type="number"
                    className="form-control"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label mb-1">Password</label>
                  <input
                    id="password"
                    type="text"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label mb-1">Select Role</label>
                  <Select
                    options={roleOptions}
                    onChange={handleChange}
                    value={formData.role}
                    id="role"
                  />
                </div>
              </div> 
              <div className="space-y-4 text-end mt-2">
                <Button text="Submit" className="btn-dark" type="submit" />
              </div>
            </div> 
            <div className="m-auto">
              <img src={AddRoleImg} alt="Add Role" className="img-fluid" width={450} />
            </div>           
          </div>
        </form>
      </Card>
    </>
  );
};

export default AddRole;
