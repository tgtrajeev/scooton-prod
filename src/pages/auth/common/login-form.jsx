import React, { useState, useEffect } from "react";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { handleLogin } from "./store";
import { ToastContainer, toast } from "react-toastify";
import { BASE_URL } from "../../../api";
import axiosInstance from "../../../api";

const schema = yup
  .object({
    userId: yup.string().trim().required("UserId is required"),
    password: yup.string().trim().required("Password is required"),
  })
  .required();

  const LoginForm = () => {
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state) => state.auth); 
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      userId: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuth) {
      navigate("/dashboard");
    }
  }, [isAuth, navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/auth/login/admin`, {
        user: data.userId,
        pwd: data.password,
      });  
      if (response.status === 200) {
        localStorage.setItem("jwtToken", response.data.token);
        localStorage.setItem("serviceAreaId", response.data.serviceAreaId);
        localStorage.setItem("userId", response.data.id);
        dispatch(handleLogin(true));
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        toast.error("Invalid credentials", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      const errorMessage = 
      error.response?.data?.error;
      console.error("Login error: ", error);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };
  
  const [checked, setChecked] = useState(false);

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit(onSubmit)} className=" ">
   
        {/* <Textinput
          name="userId"
          label="userId"
          type="userId"
          value="userId"
          register={register}
          error={errors.userId}
          className="h-[48px]"
        />
        <Textinput
          name="password"
          label="password"
          type="password"
          register={register}
          error={errors.password}
          className="h-[48px] "
        /> */}

        <div className="mb-3">
          <input
            {...register("userId")}
            placeholder="User ID"
            className="h-[48px] form-control"
          />
          <p className="text-red-500 text-sm text-right">{errors.userId?.message}</p>
        </div>        
        <div className="mb-3">
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="h-[48px] form-control"
          />
          <p className="text-red-500 text-sm text-right">{errors.password?.message}</p>
        </div>       

        <button className={` btn text-white bg-scooton-500 dark:bg-scooton-500 block w-full text-center` }>Sign in</button>
      </form>
    </>
  );
};

export default LoginForm;
