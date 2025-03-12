import React, { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import axios from "axios";
import {useTable, useRowSelect, useSortBy, usePagination,} from "react-table";
import Card from "../../components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import { BASE_URL } from "../../api";
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from "@mui/material/TextField";
import twowheeler from '../../assets/images/icon/Two_Wheeler_EV.png';
import threewheeler from '../../assets/images/icon/Three_Wheeler.png';
import tataace from '../../assets/images/icon/Tata_Ace.png'
import pickup_8ft from "../../assets/images/icon/Pickup_8ft.png";
import Modal from "../../components/ui/Modal";
import Button from "@/components/ui/Button";
import Loading from "../../components/Loading";
import Tooltip from "@/components/ui/Tooltip";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams,useSearchParams } from "react-router-dom";
import axiosInstance from "../../api";

const COLUMNS = (openIsDeleteOrder,ordersType,currentPage,filterby,search) => [
  {
    Header: "Sr. No.",
    accessor: (row, i) => i + 1,
  },            
  {
    Header: "Order ID",
    accessor: "order_Id",
  },
  {
    Header: "Mobile Number",
    accessor: "orderHistory.userInfo.mobileNumber",
  },
  {
    Header: "City",
    accessor: "City",
    Cell: () => {
        const staticValue = "Delhi";
        return staticValue;
    },
  },
  {
    Header: "Order Date",
    accessor: "orderHistory.orderDate",
    Cell: ({ cell }) => {
      const date = new Date(cell.value);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      });
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      return <div className="rider-datetime"><span className="riderDate">{`${formattedDate}`}</span><br/><span className="riderTime">{`${formattedTime}`}</span></div>;
    },
  },  
  ...(ordersType === "ALL ORDERS" ? [ 
    {
      Header: "Status",
      accessor: "orderHistory.orderStatus",
      Cell: (row) => {       
          return (
              <span className="block w-full">
              <span
                className={` inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${
                  row?.cell?.value === "COMPLETED"
                    ? "text-success-500 bg-success-500"
                    : ""
                } 
              ${
                row?.cell?.value === "PLACED"
                  ? "text-warning bg-warning-700"
                  : ""
              }
              ${
                row?.cell?.value === "CANCEL"
                  ? "text-danger-500 bg-danger-500"
                  : ""
              }
              ${
                  row?.cell?.value === "DISPATCHED"
                    ? "text-warning-500 bg-warning-400"
                    : ""
              }
              ${row?.cell?.value === "ACCEPTED"
                ? "text-info-500 bg-info-400"
                : ""
              }
              
              `}
              >
                {row?.cell?.value === 'CANCEL' ? 'CANCELLED' :
                row?.cell?.value === 'PLACED' ? 'PLACED' :
                row?.cell?.value === 'COMPLETED' ? 'DELIVERED' :
                row?.cell?.value === 'ACCEPTED' ? 'ACCEPTED' :
                'PICKED' 
                } 
              </span>
            </span>
          );
      },
    },
  ]: [] ),
  {
    Header: "Pick Up Address",
    accessor: "orderHistory.pickupAddressDetails.addressLine1"
  },
  {
    Header: "Delivery Address",
    accessor: "orderHistory.deliveryAddressDetails.addressLine1"
  },
  {
    Header: "Amount",
    accessor: "orderHistory.totalAmount",
  },
  ...( ordersType === "ACCEPTED"
    ? [
      {
        Header: "Cancel",
        accessor: "",
        Cell: (row) => {
          return (
            <button type="button" onClick={() => openIsDeleteOrder(row.row.original.orderHistory.orderId)}>
              <Icon icon="heroicons:x-mark" className="text-[24px] bg-opacity-25  rounded text-danger-500 bg-danger-500"></Icon>
            </button>
          )
    
        }
      },
    ]
    : []),
  {
    Header: "Vehicle Type",
    accessor: "vehicleId",
    Cell: (row) => {
      return (
        <div>
          {row?.cell?.value === 1 ? (
            <img className="object-cover" width={30} alt="twowheeler" class="mr-2 rounded-0" src={twowheeler}></img>
          ) : row?.cell?.value === 2 ? (
            <img className="object-cover" width={30} alt="threewheeler" class="mr-2 rounded-0" src={threewheeler}></img>
          ) : row?.cell?.value === 3 ? (
            <img className=" object-cover" width={30} alt="tataace" class="mr-2 rounded-0" src={tataace}></img>
          ) : (
            <img className="object-cover" width={30} alt="pickup_8ft" class="mr-2 rounded-0" src={pickup_8ft}></img>
          )
          }

        </div>
      )

    }
  },
  {
    Header:"Platform",
    accessor:"orderHistory.platform",
    Cell: (row) => {
      return (
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1.8 18H14l-2-3.4l-2 3.4H8.2l2.9-4.5L8.2 11H10l2 3.4l2-3.4h1.8l-2.9 4.5zM13 9V3.5L18.5 9z"/></svg>
        </div>
      )

    }
  },
  {
    Header: "Action",
    accessor: "action",
    Cell: (row) => {
      const navigate = useNavigate();
      const handleViewClick = () => {
        const orderId = row.row.original.orderHistory.orderId;
        //navigate(`/order-detail/${orderId}`);
        navigate(`/order-detail/${orderId}?customRadio=${ordersType}&page=${currentPage || 0}&searchId=${filterby || ''}&searchText=${search || ''}&orders=offline`);
      };
      return (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tooltip content="View" placement="top" arrow animation="shift-away">
            <button className="action-btn bg-scooton" type="button" onClick={handleViewClick}>
              <Icon icon="heroicons:eye" />
            </button>
          </Tooltip>
        </div>
      );
    },
  },
  
];

const OfflineOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [ordersType, SetOrderType] = useState("PLACED");
  const [filterby, setFilterBy] = useState('NONE');
  const [pagesizedata, setpagesizedata]=useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteordermodel, setDeleteOrderModel] = useState(false);
  const [orderid, setOrderDeleteId] = useState();
  const [serviceArea, setServiceArea] = useState([]);
  const [serviceAreaStatus, setServiceAreaStatus] = useState('All');
  const [searchParams] = useSearchParams();
  const [paramslength, setParamLength] = useState(0);
  const [rapf, setRapf] = useState(false)
  const [paramCurrentPage, setParamCurrentPage] = useState(0);
  const maxPagesToShow = 5;

  useEffect(() => {
    setParamLength([...searchParams.entries()].length);
    const customRadio = decodeURIComponent(searchParams.get("customRadio") || "PLACED");
    const searchId = searchParams.get("searchId") || "NONE";
    const searchText = searchParams.get("searchText") || "";
    const pageFromUrl = searchParams.get("page") || "0";
    SetOrderType(customRadio);
    setFilterBy(searchId);
    setSearch(searchText);
    setParamCurrentPage(pageFromUrl)
    setRapf(true);
  }, [searchParams]);
    
      
  useEffect(() => {
    if (!searchParams) {
      setRapf(true);
    }
  }, [])
    
  useEffect(() => {
    setCurrentPage(Number(paramCurrentPage) || 0); 
  }, [paramCurrentPage]);

  // useEffect(() =>{
  //   if(rapf == true && search =='')
  //     console.log("1")
  //     fetchOrders(ordersType)
  // },[search])

  useEffect(() => {
    if(rapf == true){
      if(filterby == 'NONE' ){
        setLoading(true);
        fetchOrders(ordersType);
      }
    }
  }, [rapf,currentPage,pagesizedata]);

  const fetchOrders = (orderType) => {
    
    setLoading(true);
    SetOrderType(orderType);
    let searchtype
    if(search == ''){
      searchtype = 'NONE'
    }else{
      searchtype = filterby
    }
    const dataToSend ={
      "orderType": orderType, "searchType": searchtype
    }
    
    if (filterby != 'NONE' && search != '') {
      dataToSend.number = search; 
    }
    axiosInstance
      .post(
        `${BASE_URL}/order-history/search-city-wide-orders-all-service-area-isOfflineOrder/0/true?page=${currentPage}&size=${pagesizedata}`,
        dataToSend,

      )
      .then((response) => {
        setOrderData(response.data);
        setTotalCount(Number(response.headers["x-total-count"])); 
        setPageCount(Number(response.headers["x-total-pages"]));
      })
      .catch((error) => {
        console.error("Error fetching order data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
    
  };

  const openIsDeleteOrder = async (id) => {
    setDeleteOrderModel(true)
    setOrderDeleteId(id)
  }

  const replaceOrder = () => {
    axiosInstance.get(`${BASE_URL}/order/accepted-order-reorder/${orderid}`).then((response)=>{
      toast.success(response)
    }).catch((error) => {
      console.error(error);
    })
  }

  const cancelOrder = () => {
    axiosInstance.post(`${BASE_URL}/order/v2/cancel-order/${orderid}`).then((response)=>{
      toast.success(response)
    }).catch((error) => {
      console.error(error);
    })
  }
  
  

  const columns = useMemo(() => COLUMNS(openIsDeleteOrder,ordersType,currentPage,filterby,search), [ordersType,currentPage,filterby,search]);
  const tableInstance = useTable(
    {
      columns,
      data: orderData,
      initialState: {
        pageIndex: currentPage,
        pageSize: 10,
      },
      manualPagination: true, 
      pageCount, 
    },
    useSortBy,
    usePagination,
    useRowSelect
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    setPageSize,
    prepareRow,
  } = tableInstance;

  const { pageIndex, pageSize } = state;
  const handlePageSizeChange = (newSize) => {
    setpagesizedata(newSize); 
    setCurrentPage(0); 
    
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleChange = (event) => {
    const value = event.target.value;
   
      setFilterBy(value);
    
    if (value == "NONE") {
      setSearch("");
    }
  };

  useEffect(() => {
    if (rapf == true) {
      if (filterby == 'NONE') {
        setSearch("")
        setFilterBy("NONE")
        FilterOrder();

      }
    }
  }, [filterby]);

  useEffect(() => {
    if (rapf == true) {
      if(filterby !='NONE' && search != ''){
        FilterOrder();
      }
    }
      
  }, [filterby, search,currentPage,pagesizedata, rapf]);

  const FilterOrder = () => {
    setLoading(true);
    axiosInstance
      .post(
        `${BASE_URL}/order-history/search-city-wide-orders-all-service-area-isOfflineOrder/0/true?page=0&size=${pagesizedata}`,
        { "number": search, "orderType": ordersType, "searchType": filterby },

      )
      .then((response) => {
        setOrderData(response.data);
        setTotalCount(Number(response.headers["x-total-count"])); 
        setPageCount(Number(response.headers["x-total-pages"]));
      })
      .catch((error) => {
        console.error("Error fetching order data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setCurrentPage(pageIndex);
  }, [pageIndex]);
  // get Service area 
  useEffect(() => {
    const fetchServiceAreas = async () => {
      try {
        const response = await axiosInstance.get(`${BASE_URL}/service-area/get-all`);
        setServiceArea(response.data);
      } catch (error) {
        console.error('Error fetching service areas:', error);
      }
    };
    fetchServiceAreas();
  }, []);

  const filterOrders = () => {
    setLoading(true);
    const token = localStorage.getItem("jwtToken");
    try {
      axiosInstance
        .post(
          `${BASE_URL}/order-history/search-city-wide-orders/${serviceAreaStatus}?page=${currentPage}&size=100`,
          {
            orderType: "PLACED",
            searchType: "NONE", 
            number: 0,           
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .then((response) => {
          setOrderData(response.data);
          setTotalCount(Number(response.headers["x-total-count"])); 
          setPageCount(Number(response.headers["x-total-pages"]));
        })
        .catch((error) => {
          console.error("Error fetching rider data:", error);
        }).finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if(search == ''){
      setLoading(true);
      axiosInstance
        .post(
          `${BASE_URL}/order-history/search-city-wide-orders-all-service-area-isOfflineOrder/0/true?page=${currentPage}&size=${pagesizedata}`,
          { "number": search, "orderType": ordersType, "searchType": 'NONE' },

        )
        .then((response) => {
          setOrderData(response.data);
          setTotalCount(Number(response.headers["x-total-count"])); 
          setPageCount(Number(response.headers["x-total-pages"]));
        })
        .catch((error) => {
          console.error("Error fetching order data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
      }
  },[search])

  // useEffect(() => {
  //   filterOrders();
  // }, [serviceAreaStatus, currentPage]);

  const serviceAreaStatusFilter = (event) => {
    setServiceAreaStatus(event.target.value);
  };
  // show hide
  const [isVisible, setIsVisible] = useState(false);
  const handleShow = () => {
    setIsVisible(!isVisible); 
  };

  
  return (
    <>
      <ToastContainer/>
      <Card>
      <div className="order-header">
          <div className="mb-4">
            <div className="md:flex justify-between items-center mb-2">
              <h4 className="card-title mb-0">Offline Orders</h4>
              <div className="">
                {/* <FormControl fullWidth>
                  <label className="text-sm">Filter By</label>
                    <div className="filterbyRider"> 
                      <Select
                        id="demo-simple-select"
                        value={filterby}
                        //label="Filter By"
                        onChange={handleChange}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                      >
                        <MenuItem value="NONE">Select</MenuItem>
                        <MenuItem value="ORDERID">Order ID</MenuItem>
                        <MenuItem value="MOBILE">Mobile Number</MenuItem>
                      </Select>           
                      <TextField
                        id="search"
                        type="text"
                        name="search"
                        value={search}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </FormControl> */}
              </div>
              {/* <div className="rider-filter">            
                <div className="d-flex justify-content-end">              
                  <Button className="btn btn-dark desktop-view-filter" onClick={handleShow}>
                    <Icon icon="heroicons:adjustments-horizontal" className="text-[20px]"></Icon>
                  </Button>
                </div>
              </div> */}
            </div>
            {/* {isVisible && (
              <div className="filter-show">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <FormControl fullWidth className="mb-3">
                      <label className="text-sm">Service Area</label>
                      <Select
                        id="demo-simple-select"
                        value={serviceAreaStatus}
                        onChange={serviceAreaStatusFilter}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                      >
                        <MenuItem value="ALL" selected>ALL</MenuItem>
                        {serviceArea.map((city, index) => (
                          <MenuItem value={city.id} key={index} id={city.id}>{city.name}</MenuItem>
                        ))}                        
                      </Select>
                    </FormControl>
                  </div>
                  <div className="flex-1">
                    <FormControl fullWidth>
                      <label className="text-sm">Filter By</label>
                        <div className="filterbyRider"> 
                          <Select
                            id="demo-simple-select"
                            value={filterby}
                            //label="Filter By"
                            onChange={handleChange}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                          >
                            <MenuItem value="NONE">NONE</MenuItem>
                            <MenuItem value="ORDERID">ORDER ID</MenuItem>
                            <MenuItem value="MOBILE">Mobile Number</MenuItem>
                          </Select>           
                          <TextField
                            id="search"
                            type="text"
                            name="search"
                            value={search}
                            onChange={handleSearchChange}
                          />
                        </div>
                      </FormControl>
                  </div>
                </div>
              </div>
            )} */}
            
          </div>
          <div className="filter-orderlist">
            <div className={loading ? "tabs":""}>
              <FormControl>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  onChange={(e) => fetchOrders(e.target.value)}
                  value={ordersType}
                >
                  <FormControlLabel value="PLACED" control={<Radio />} label="PLACED" />
                  <FormControlLabel value="ACCEPTED" control={<Radio />} label="ACCEPTED" />
                  <FormControlLabel value="PICKED" control={<Radio />} label="PICKED" />
                  <FormControlLabel value="DELIVERED" control={<Radio />} label="DELIVERED" />
                  <FormControlLabel value="CANCELLED" control={<Radio />} label="CANCELLED" />
                  <FormControlLabel value="ALL ORDERS" control={<Radio />} label="ALL ORDERS" />
                </RadioGroup>
              </FormControl>
            </div>
            <div>
              <FormControl >
                <label className="text-sm mb-1">Filter By</label>
                  <div className="filterbyRider"> 
                    <Select
                      id="demo-simple-select"
                      value={filterby}
                      //label="Filter By"
                      onChange={handleChange}
                      inputProps={{ 'aria-label': 'Without label' }}
                    >
                      <MenuItem value="NONE">Select</MenuItem>
                      <MenuItem value="ORDERID">Order ID</MenuItem>
                      <MenuItem value="MOBILE">Mobile Number</MenuItem>
                    </Select>           
                    <TextField
                      id="search"
                      type="text"
                      name="search"
                      value={search}
                      disabled={filterby == 'NONE'}
                      onChange={handleSearchChange}
                    />
                  </div>
              </FormControl>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto -mx-6 my-4">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden ">
              {loading ? (
                <div className="flex justify-center items-center w-100">
                  <Loading /> 
                </div>
              ) : ( 
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                {...getTableProps()}
              >
                <thead className=" bg-slate-200 dark:bg-slate-700">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            // column.getSortByToggleProps()
                          )}
                          scope="col"
                          className=" table-th "
                        >
                          {column.render("Header")}
                          {/* <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " 🔽"
                                : " 🔼"
                              : ""}
                          </span> */}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                    className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                    {...getTableBodyProps()}
                  >
                        {page.length > 0 ? (
                          page.map((row) => {
                        prepareRow(row);
                        return (
                          <tr {...row.getRowProps()} key={row.id}>
                            {row.cells.map((cell) => (
                              <td {...cell.getCellProps()} className="table-td" key={cell.column.id}>
                                {cell.render("Cell")}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={headerGroups[0]?.headers.length || 1}
                          className="text-center py-4 text-gray-500"
                        >
                          No record found
                        </td>
                      </tr>
                    )}
                  </tbody>
                
              </table>
                )}
            </div>
          </div>
        </div>
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className=" flex items-center space-x-3 rtl:space-x-reverse">
            <select
              className="form-control py-2 w-max"
              value={pagesizedata}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {[10,20,30,40,50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page{" "}
              <span>
                {pageIndex + 1} of {pageOptions.length}
              </span>
            </span>
          </div>
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            {totalCount > pagesizedata && (
              <>
                <li>
                  <button
                    onClick={() => gotoPage(0)}
                    disabled={currentPage === 0}
                    className={currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <Icon icon="heroicons:chevron-double-left-solid" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    Prev
                  </button>
                </li>
                {(() => {
                  const totalPages = pageCount; 
                  const currentGroup = Math.floor(currentPage / maxPagesToShow); 
                  const startPage = currentGroup * maxPagesToShow; 
                  const endPage = Math.min(startPage + maxPagesToShow, totalPages); 

                  return (
                    <>
                      {startPage > 0 && (
                        <li>
                          <button onClick={() => setCurrentPage(startPage - 1)}>
                            ...
                          </button>
                        </li>
                      )}
                      {Array.from({ length: endPage - startPage }).map((_, idx) => {
                        const pageNumber = startPage + idx;
                        return (
                          <li key={pageNumber}>
                            <button
                              className={` ${pageNumber === currentPage
                                ? "bg-scooton-900 dark:bg-slate-600  dark:text-slate-200 text-white font-medium"
                                : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900  font-normal"
                              } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150 `}
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber + 1}
                            </button>
                          </li>
                        );
                      })}
                      {endPage < totalPages && (
                        <li>
                          <button onClick={() => setCurrentPage(endPage)}>
                            ...
                          </button>
                        </li>
                      )}
                    </>
                  );
                })()}
                <li>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= pageCount - 1}
                    className={
                      currentPage >= pageCount - 1 ? "opacity-50 cursor-not-allowed" : ""
                    }
                  >
                    Next
                  </button>
                </li>

                {/* Last Page Button */}
                <li>
                  <button
                    onClick={() => gotoPage(pageCount - 1)}
                    disabled={currentPage >= pageCount - 1}
                    className={
                      currentPage >= pageCount - 1 ? "opacity-50 cursor-not-allowed" : ""
                    }
                  >
                    <Icon icon="heroicons:chevron-double-right-solid" />
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </Card>

      {deleteordermodel && (
        <Modal
          activeModal={deleteordermodel}
          uncontrol
          className="max-w-md"
          title=""
          centered
          onClose={() => setDeleteOrderModel(false)}
        >
          <div className="">
            <h5 className="text-center">Order Replace/Cancel</h5>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <p>
                Are you want to Replace Order ?
              </p>
              <Button className="btn btn-dark" type="button" onClick={() => {replaceOrder();setDeleteOrderModel(false)}}>
                yes
              </Button>
            </div>
            <div className="d-flex gap-2 justify-content-center mt-4">
                <p>
                  Are you want to Cancel Order ?
                </p>
                <Button className="btn btn-dark" type="button" onClick={() =>{cancelOrder();setDeleteOrderModel(false)}}>
                  yes
                </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default OfflineOrders;
