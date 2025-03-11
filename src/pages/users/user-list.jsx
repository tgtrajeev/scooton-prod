import React, { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import {useTable, useRowSelect, useSortBy, usePagination,} from "react-table";
import Card from "../../components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Switch from "@/components/ui/Switch";
import { BASE_URL } from "../../api";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import Tooltip from "@/components/ui/Tooltip";
import { toast } from "react-toastify";
import axiosInstance from "../../api";

const COLUMNS = [
  
  {
    Header: "Sr. No.",
    accessor: (row, i) => i + 1,
  },
  {
    Header: "User Id",
    accessor: "id",
  },
  {
    Header: "Name",
    accessor: "firstName",
    Cell: (row) => {
      const { original } = row.row;
      const firstName = original.firstName || "";
      const lastName = original.lastName || "";
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
    accessor: "mobileNumber",
  },
  {
    Header: "Created Date",
    accessor: "createdAt",
    Cell: ({ cell }) => {
      const date = new Date(cell.value);
      if (isNaN(date.getTime())) {
        return (
          <div className="rider-datetime text-center">
            <span className="riderDate"></span>            
            <span className="riderTime"></span>
          </div>
        );
      }
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
      return <div className="rider-datetime"><span className="riderDate">{`${formattedDate}`}{`${formattedTime}`}</span></div>;
    },
  },
  {
    Header: "Last Activity Date",
    accessor: "lastActivity",
    Cell: ({ cell }) => {
      const date = new Date(cell.value);
      if (isNaN(date.getTime())) {
        return (
          <div className="rider-datetime text-center">
            <span className="riderDate"></span>            
            <span className="riderTime"></span>
          </div>
        );
      }
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
      return <div className="rider-datetime"><span className="riderDate">{`${formattedDate}`}{`${formattedTime}`}</span></div>;
    },
  },
  // {
  //   Header: "Status",
  //   accessor: "active",
  //   Cell: ({ value }) => {
  //     const statusClass = value ? "text-success-500 bg-success-500" : "text-warning-500 bg-warning-500";
  //     const statusText = value ? "Active" : "Inactive";
  
  //     return (
  //       <span className={`block w-full`}>
  //         <span
  //           className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${statusClass}`}
  //         >
  //           {statusText}
  //         </span>
  //       </span>
  //     );
  //   },
  // },
  // {
  //   Header: "Action",
  //   accessor: "active",
  //   Cell: ({ row }) => {
  //     const isActive = row.value;
  //     return (
  //       <span>
  //         <Switch
  //           activeClass="bg-danger-500"
  //           checked={isActive}
  //         />
  //       </span>
  //     );
  //   },
  // }
  {
    Header: "Action",
    accessor: "active",
    Cell: ({ row }) => {
      const [isActive, setIsActive] = useState(row.original.active);
       const toggleActive = async (id) => {
        try {
          const newState = !isActive;
          await axiosInstance.post(`${BASE_URL}/user/active/${id}`,{active: newState});
          setIsActive(newState);
          toast.success()
          
        } catch (error) {
          console.error("Error toggling user active state:", error);
        }
      };

      return (
        
        <span>
          {/* <Switch
            activeClass="bg-danger-500"
            checked={isActive}
            onChange={toggleActive}
          /> */}
          
          <Switch
            value={isActive}
            onChange={() => toggleActive(row.original.id)}
          />
        </span>
      );
    },
  },
  {
    Header: "Action",
    accessor: "action",
    Cell: (row) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        const mobileno= row.row.original.mobileNumber
        navigate(`/all-orders/${mobileno}/ALL ORDERS/MOBILE`);
      };
      return (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tooltip content="View" placement="top" arrow animation="shift-away">
            <button className="action-btn bg-scooton" type="button" onClick={() => handleViewClick()}>
              <Icon icon="heroicons:eye" />
            </button>
          </Tooltip>          
        </div>
      );
    },
  },
];

const UserList = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [pagesizedata, setpagesizedata]=useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const maxPagesToShow = 5;

  useEffect(() => {
    setLoading(true);
    setSearch("");
    const token = localStorage.getItem("jwtToken");
    if (token) {
      axiosInstance
        .get(`${BASE_URL}/user/get-all?page=${currentPage}&size=${pagesizedata}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUserData(response.data);
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
  }, [currentPage,pagesizedata]);
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("jwtToken");
    const fetchData = async () => {
      try {
        if (!token) return;
  
        if (search) {
          const response = await axiosInstance.post(
            `${BASE_URL}/user/search-by-mobile-number`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { mobileNumber: search.trim(), page: 0, size: pagesizedata },
            }
          );
          setLoading(false);
          setUserData(response.data);
          setTotalCount(Number(response.headers["x-total-count"]));
          setPageCount(Number(response.headers["x-total-pages"]));
        } else {
          const response = await axiosInstance.get(`${BASE_URL}/user/get-all`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: currentPage, size: pagesizedata },
          });
          setUserData(response.data);
          setTotalCount(Number(response.headers["x-total-count"]));
          setPageCount(Number(response.headers["x-total-pages"]));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchData();
  }, [search, currentPage,pagesizedata])
  
  

  const columns = useMemo(() => COLUMNS, []);
  const tableInstance = useTable(
    {
      columns,
      data: userData,
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

  useEffect(() => {
    setCurrentPage(pageIndex);
  }, [pageIndex]);
  
  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Users List</h4>
          <div className="d-flex border rounded align-items-center p-2">
            <input
                placeholder="Search by mobile number"
                className="focus-invisible"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Icon icon="heroicons-outline:search" />
          </div>
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
                      {[10, 20, 30, 40, 50].map((pageSize) => (
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
                                        ? " bg-scooton-900 dark:bg-slate-600  dark:text-slate-200 text-white font-medium text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150 "
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

export default UserList;
