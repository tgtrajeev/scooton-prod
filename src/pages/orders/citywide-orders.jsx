import React, { useState, useMemo, useEffect } from "react";
import Order from "./order";

const notificationtype = ['All', 'INDIVIDUAL']



const CityWideOrders = () => {

  return (
    <>
      <Order orderCategory='CITYWIDE' isOfflineOrder='false' />
    </>
  );
};

export default CityWideOrders;
