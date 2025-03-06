import React, { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import {useTable, useRowSelect, useSortBy, usePagination,} from "react-table";
import Card from "../../components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Switch from "@/components/ui/Switch";
import { BASE_URL } from "../../api";
import twowheeler from '../../assets/images/icon/Two_Wheeler_EV.png';
import threewheeler from '../../assets/images/icon/Three_Wheeler.png';
import tataace from '../../assets/images/icon/Tata_Ace.png'
import pickup_8ft from "../../assets/images/icon/Pickup_8ft.png";
import Eeco from '../../assets/images/icon/Eeco.png';
import campion from '../../assets/images/icon/Champion.png'
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import Tooltip from "@/components/ui/Tooltip";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from "@mui/material/TextField";
import Button from "../../components/ui/Button";
import axiosInstance from "../../api";
import { useSearchParams  } from "react-router-dom";

const COLUMNS = ({ currentPage, riderstatus, vehicleid }) => [
  {
    Header: "Sr. No.",
    accessor: (row, i) => i + 1,
  },
  {
    Header: "Rider Id",
    accessor: "riderInfo.id",
  },
  {
    Header: "Name",
    accessor: "riderInfo.firstName",
    Cell: (row) => {
        const { original } = row.row;
        const firstName = original.riderInfo.firstName || "";
        const lastName = original.riderInfo.lastName || "";
        const imageUrl = original.media ? original.media.url : null;
  
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
      return (
        <span className="flex items-center">
          <div className="flex-none">
            <div className="w-8 h-8 rounded-[100%] ltr:mr-3 rtl:ml-3">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Rider"
                  className="w-full h-full rounded-[100%] object-cover"
                />
              ) : (
                <span className="text-white bg-scooton-500 font-medium rounded-[50%] w-8 h-8 flex items-center justify-center">{initials}</span>
              )}
            </div>
          </div>
          <div className="flex-1 text-start">
            <h4 className="text-sm font-medium text-slate-600 whitespace-nowrap">
              {row?.cell?.value || "No Name"}
            </h4>
          </div>
        </span>
      );
    },
  },
  {
    Header: "Mobile",
    accessor: "riderInfo.mobileNumber",
  },
  {
    Header: "Created Date",
    accessor: "riderInfo.createdDate",
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
  {
    Header: "Last Activity Date",
    accessor: "riderInfo.lastActivity",
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
  {
    Header: "Status",
    accessor: "riderInfo.status"
  },
  {
    Header: "Online/Offline",
    accessor: "riderInfo.riderActiveForOrders",
    Cell: ({ value }) => {
      const statusClass = value ? "text-success-500 bg-success-500" : "text-warning-500 bg-warning-500";
      const statusText = value ? "Online" : "Offline";
  
      return (
        <span className={`block w-full`}>
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${statusClass}`}
          >
            {statusText}
          </span>
        </span>
      );
    },
  },
  {
    Header: "Vehicle Type",
    accessor: "riderInfo.vehicleType",
    Cell: (row) => {
      return (
        <div>
          {row.row.original.riderInfo?.vehicleId === 1 ? ( 
            <img className="object-cover" width={30} alt="twowheeler" class="mr-2 rounded-0" src={twowheeler}></img>
          ): row.row.original.riderInfo?.vehicleId === 2 ? (
              <img className="object-cover" width={30} alt="twowheeler" class="mr-2 rounded-0" src={twowheeler}></img>
          ): row.row.original.riderInfo?.vehicleId === 4 ? (
            <img className="object-cover" width={30} alt="threewheeler" class="mr-2 rounded-0" src={threewheeler}></img>
          ) : row.row.original.riderInfo?.vehicleId === 3 ? (
            <img className=" object-cover" width={30} alt="tataace" class="mr-2 rounded-0" src={tataace}></img>
          ) : (
            <img className="object-cover" width={30} alt="pickup_8ft" class="mr-2 rounded-0" src={pickup_8ft}></img>
          )
          }
        </div>
      );
    }
    
  },
  {
    Header: "Action",
    accessor: "action",
    Cell: (row) => {
      const navigate = useNavigate();
      const handleViewClick = () => {
        const riderId = row.row.original.riderInfo.id;
        //navigate(`/rider-detail/${riderId}`);
        navigate(`/rider-detail/${riderId}?page=${currentPage || 0}&riderStatus=${riderstatus}&vehicleid=${vehicleid}&rider=register`);
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

const RegisteredRiders = () => {
  const [loading, setLoading] = useState(true);
  const [riderData, setRiderData] = useState([]);
  const [activeridercount, setActiveRiderCount] = useState([])
  const [search, setSearch] = useState("");
  const [riderstatus, setRiderStatus]= useState('ALL')
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [pagesizedata, setpagesizedata]=useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterby, setFilterBy] = React.useState('NONE');
  const [vehicleid, setVehicleId]= useState('0');
  const maxPagesToShow = 5;
  const [paramslength, setParamLength] = useState(0);
  const [searchParams] = useSearchParams();
  const [rapf, setRapf] = useState(false)

  useEffect(() => {
    console.log([...searchParams.entries()].length);
    setParamLength([...searchParams.entries()].length);
    const statusFromUrl = searchParams.get("riderStatus") || "ALL";
    const vehicleIdFromUrl = searchParams.get("vehicleid") || "0";
    const pageFromUrl = searchParams.get("page") || "0";
    console.log("statusFromUrl",statusFromUrl)
    setRiderStatus(statusFromUrl);
    setVehicleId(vehicleIdFromUrl);
    setCurrentPage(pageFromUrl);
    setRapf(true);
    
  }, [searchParams]);


  useEffect(() => {
    if (!searchParams) {
      setRapf(true);
    }
  }, [])


  useEffect(() => {
    fetchRegisterOrder();
  }, [currentPage,pagesizedata,rapf]);


  const vehicleIdFilter = (event) => {
    setVehicleId(event.target.value);
  };

  const fetchRegisterOrder = () =>{
    const token = localStorage.getItem("jwtToken");
    if (token) {
      if (rapf == true && riderstatus === "ALL" && vehicleid === "0" && filterby == "NONE"){
        axiosInstance
          .get(`${BASE_URL}/register/v2/rider/get-all-service-area-by-registration-status/REGISTERED/0/ALL/0?page=${currentPage}&size=${pagesizedata}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            setRiderData(response.data);
            setTotalCount(Number(response.headers["x-total-count"])); 
            //setPageCount(Math.ceil(Number(response.headers["x-total-count"]) / pageSize)); 
            setPageCount(Number(response.headers["x-total-pages"]));
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          })
          .finally(() => {
            setLoading(false); 
          });
      }
    }
  }
  // Get Rider Count
  useEffect(() => {
    try {
      axiosInstance.get(`${BASE_URL}/login/get-online-offline-rider/0/REGISTERED`).then((response) => {
        setActiveRiderCount(response.data)
      })
    } catch {
      console.log(error)
    }
  }, [])
  // End
  const filterRiders = () => {
    if(rapf == false){
      if(riderstatus == "ALL" && vehicleid === "0") return;
    }
    const token = localStorage.getItem("jwtToken");
    try {
      axiosInstance
        .get(
          `${BASE_URL}/register/v2/rider/get-all-service-area-by-registration-status/REGISTERED/0/${riderstatus}/${vehicleid}?page=${currentPage}&size=${pagesizedata}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log("w")
          setFilterBy("NONE");
          setSearch("");
          setRiderData(response.data);
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
    filterRiders();
  }, [riderstatus, vehicleid,currentPage,pagesizedata]);

  const riderStatusFilter = (event) => {
    setRiderStatus(event.target.value);
  };
  

  const columns = useMemo(() => COLUMNS({ currentPage,riderstatus, vehicleid }), [currentPage,  riderstatus, vehicleid]);
  const tableInstance = useTable(
    {
      columns,
      data: riderData,
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
  useEffect(() => {
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  const handlePageSizeChange = (newSize) => {
    setpagesizedata(newSize); 
    setCurrentPage(0);  
  };

  useEffect(() => {
    if(filterby){
      FilterRiders();
    }
      
  }, [filterby, search,currentPage]);

  const handleChange = (event) => {
    setFilterBy(event.target.value);
    if (event.target.value === 'NONE') {
      setSearch("");
      fetchRegisterOrder()
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const FilterRiders = () =>{
    if(filterby !== "NONE"){
      setRiderStatus('ALL');
    }
    
    const token = localStorage.getItem("jwtToken");
    axiosInstance.get(`${BASE_URL}/register/rider/get-rider-by-mobilenumber-or-riderid/${filterby}/${search}?page=${currentPage}&size=30`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    ).then((response) => {
    
      setRiderData(response.data);
      setTotalCount(Number(response.headers["x-total-count"]));
      setPageCount(Number(response.headers["x-total-pages"]));
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    })
    .finally(() => {
      setLoading(false); 
    });
  }

  useEffect(() => {
    if(search == ''){
      setLoading(true);
      const token = localStorage.getItem("jwtToken");
      if (token) {
        if(rapf == true && riderstatus === "ALL" 
          && vehicleid === "0" ){
          axiosInstance
            .get(`${BASE_URL}/register/v2/rider/get-all-service-area-by-registration-status/REGISTERED/0/ALL/0?page=${currentPage}&size=${pagesizedata}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((response) => {
              setRiderData(response.data);
              setTotalCount(Number(response.headers["x-total-count"]));
              setPageCount(Number(response.headers["x-total-pages"])); 
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    }
  }, [search]); 
  // show hide
  const [isVisible, setIsVisible] = useState(true);
  const handleShow = () => {
    setIsVisible(!isVisible); 
  };
   // Clear the search input field
   const resetFilters = () => {
    // setServiceAreaStatus("ALL");
    setRiderStatus("ALL");
    //setDocumentStatus("ALL");
    setVehicleId("0");
    setFilterBy("NONE");
    setSearch(""); 
  }

  
  return (
    <>
      <Card>
        <div className="filter-showhide">
          <div className="md:flex justify-between items-center mb-6">
            <div className="rider-status">
              <div className="all-riders">
                <h4 className="card-title">
                  <div className="all-rider-mobile">
                    <span>Registered Riders</span>
                    <div className="onOff-riders">
                      <div className="all-rider"><span></span> {activeridercount.allRider} (Total Riders)</div>
                      <div className="online"><span></span> {activeridercount.onlineRider} (Online)</div>
                      <div className="offline"><span></span> {activeridercount.offlineRider} (Offline)</div>
                    </div>
                  </div>
                </h4>
                <span className="mobile-view">
                  <Button className="btn btn-dark" onClick={handleShow}>
                    <Icon icon="heroicons:adjustments-horizontal" className="text-[20px]"></Icon>
                  </Button>
                </span>              
              </div>
              <div className="d-flex gap-2">
                {Array.isArray(activeridercount?.onlineRiderCategoryWise) &&
                activeridercount.onlineRiderCategoryWise.map((riderVehicle) => {
                  const { categoryId, vehicleType } = riderVehicle;
                  return (
                    <span key={categoryId}>
                      {categoryId === 1 && vehicleType === "Two Wheeler" ? (
                        <div className="rider-count">
                          <img src={twowheeler} alt="Two-Wheeler" width={30} />
                          {riderVehicle.riderCount} 
                        </div>
                      ) : categoryId === 2 && vehicleType === "Three Wheeler" ? (
                        <div className="rider-count">
                          <img src={threewheeler} alt="Three-Wheeler" width={30} />
                          {riderVehicle.riderCount} 
                        </div>
                      ) : categoryId === 3 && vehicleType === "Tata Ace" ? (
                        <div className="rider-count">
                          <img src={tataace} alt="Tata Ace" width={30} />
                          {riderVehicle.riderCount} 
                        </div>
                      ) : categoryId === 4 && vehicleType === "Pickup 8ft" ? (
                        <div className="rider-count">
                          <img src={pickup_8ft} alt="Pickup 8ft" width={30} />
                          {riderVehicle.riderCount} 
                        </div>
                      ) : null}
                    </span>
                  );
                })}             
              </div>
            </div>
            <div className="filterbyRider me-3">
              <FormControl fullWidth className="">
                <div className="filterbyRider">                    
                  <Select
                    id="demo-simple-select"
                    value={filterby}
                    onChange={handleChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                  >
                    <MenuItem value="NONE">Select</MenuItem>
                    <MenuItem value="RIDERID">Rider ID</MenuItem>
                    <MenuItem value="MOBILE">Mobile Number</MenuItem>
                    <MenuItem value="RIDERNAME">Rider Name</MenuItem>
                  </Select>
                  <TextField
                    id="search"
                    type="text"
                    name="search"
                    className=""
                    placeholder="Filter By"
                    value={search}
                    onChange={handleSearchChange}
                  />
                </div>
              </FormControl>
            </div>
            <div className="rider-filter">            
              <div className="d-flex justify-content-end">              
                <Button className="btn btn-dark desktop-view-filter" onClick={handleShow}>
                  <Icon icon="heroicons:adjustments-horizontal" className="text-[20px]"></Icon>
                </Button>
              </div>
            </div>            
          </div>
          {isVisible && (
              <div className="filter-show">
                <div className="">                 
                  <div className="flex-1">
                    <FormControl fullWidth className="">
                      <label className="text-sm mb-1">Rider Status</label>
                      <Select
                        id="demo-simple-select"
                        value={riderstatus}
                        onChange={riderStatusFilter}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                      >
                        <MenuItem value="ALL">ALL</MenuItem>
                        <MenuItem value="ONLINE">ONLINE</MenuItem>
                        <MenuItem value="OFFLINE">OFFLINE</MenuItem>
                      </Select>
                    </FormControl>
                  </div> 
                  <div className="flex-1">
                  <FormControl fullWidth className="">
                    <label className="text-sm mb-1">Vehicle Type</label>
                    <Select
                      id="demo-simple-select"
                      //label="Vehicle_Status"
                      value={vehicleid}
                      onChange={vehicleIdFilter}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                    >
                      <MenuItem value="0">ALL</MenuItem>
                      <MenuItem value="1">Two Wheeler</MenuItem>
                      <MenuItem value="2">Two Wheeler EV</MenuItem>
                      <MenuItem value="4">Three Wheeler</MenuItem>
                      <MenuItem value="7">Pickup 8ft</MenuItem>
                      <MenuItem value="3">TATA Ace</MenuItem>
                    </Select>
                  </FormControl>
                </div>                 
                  
                  <div className="d-flex gap-2 justify-content-end">
                    <div className="h-100">
                      <button className="btn btn-dark h-100 text-xl" onClick={resetFilters}><Icon icon="heroicons:arrow-path" /></button>
                    </div>
                    <div className="h-100">
                      <button className="btn btn-dark h-100 py-2" onClick={() => handleShow}>Submit</button>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
        <div className="overflow-x-auto -mx-6">
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
              {[10, 20, 30,40,50].map((pageSize) => (
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
    </>
  );
};

export default RegisteredRiders;
