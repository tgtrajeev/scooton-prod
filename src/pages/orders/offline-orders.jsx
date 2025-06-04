import React, { useState, useMemo, useEffect } from "react";
import Order from "./order";



const OfflineOrders = () => {
 
  
  return (
    <>
       <Order orderCategory='CITYWIDE' isOfflineOrder='true' />
    </>
  );
};

export default OfflineOrders;
