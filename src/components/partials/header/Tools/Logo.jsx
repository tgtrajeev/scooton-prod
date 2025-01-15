import React from "react";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useWidth from "@/hooks/useWidth";

import MainLogo from "@/assets/images/logo/logo.png";

const Logo = () => {

  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  return (
    <div>
      <Link to="/dashboard">
        {width >= breakpoints.xl ? (
          <img src={MainLogo} alt="" />
        ) : (
          <img src={MainLogo} alt="scooton" width={120} />
        )}
      </Link>
    </div>
  );
};

export default Logo;
