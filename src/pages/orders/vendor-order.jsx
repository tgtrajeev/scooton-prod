import React, { useState, useMemo, useEffect } from "react";
import Order from "./order";

const Vendor = ({ }) => {

  return (
    <>
      <Order thirdPartyVendorName ='SHIPROCKET' orderCategory='THIRDPARTY' isOfflineOrder ='true'/>
    </>
  );
};

export default Vendor;
