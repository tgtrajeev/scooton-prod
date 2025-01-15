import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./common/login-form";
import { ToastContainer } from "react-toastify";

// image import
import Logo from "@/assets/images/logo/logo.png";
import Illustration from "@/assets/images/login-img.png";

const login = () => {
  return (
    <>
      <ToastContainer />
      <div className="loginwrapper">
        <div className="lg-inner-column">
          <div className="left-column relative z-[1]">
            <div className="max-w-[600px] pt-20 ltr:pl-20 rtl:pr-20">
              <Link to="/">
                <img src={Logo} alt="" className="mb-10" width={200} />
              </Link>
              <h4>
              <span className="text-scooton-800 dark:text-slate-400 font-bold">
                Parcel delivery, made easy  <br></br>
                </span>
                Realtime parcel delivery service in Your city
                
              </h4>
            </div>
            <div className="absolute left-0 2xl:bottom-[-160px] bottom-[-130px] h-full w-full z-[-1]">
              <img
                src={Illustration}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <div className="right-column relative">
            <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800">
              <div className="auth-box h-full flex flex-col justify-center">
                <div className="mobile-logo text-center mb-6 lg:hidden block">
                  <Link to="/">
                    {/* <img
                      src={Logo}
                      alt=""
                      className="mx-auto"
                      width={200}
                    /> */}
                  </Link>
                </div>
                <div className="text-center 2xl:mb-10 mb-4">
                  <h4 className="font-medium">Sign in</h4>
                  <div className="text-slate-500 text-base">
                    Sign in to your account to start using Scooton
                  </div>
                </div>
                <LoginForm />
              </div>
              <div className="auth-footer text-center">
                Copyright 2024, Scooton All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default login;
