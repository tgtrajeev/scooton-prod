import React, { useState, useMemo, useEffect, useCallback } from "react";
import Icon from "@/components/ui/Icon";
import axios from "axios";
import { useTable, useRowSelect, useSortBy, usePagination } from "react-table";
import Card from "../../components/ui/Card";
import { BASE_URL } from "../../api";
import Tooltip from "@/components/ui/Tooltip";
import Loading from "../../components/Loading";
import Modal from "../../components/ui/Modal";
import Button from "@/components/ui/Button";

import Switch from "@/components/ui/Switch";
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import axiosInstance from "../../api";


const promocodeType = ["FIXED", "PERCENTAGE"];

const COLUMNS = (deleteUser, openEditModal) => [
  {
    Header: "Sr. No.",
    accessor: (row, i) => i + 1,
  },
  {
    Header: "Code",
    accessor: "promoCode",
  },
  {
    Header: "Code Type",
    accessor: "promoCodeType",
  },
  {
    Header: "Discount",
    accessor: "amount",
  },
  {
    Header: "Expiration",
    accessor: "expireDate",
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
      return <div className="rider-datetime"><span className="riderDate">{`${formattedDate}`}</span>, <span className="riderTime">{`${formattedTime}`}</span></div>;
    },
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: ({ row }) => {
      const [isActive, setIsActive] = useState(row.original.active);
      const token = localStorage.getItem("jwtToken");
       const toggleActive = async (id) => {
        try {
          const newState = !isActive;
          await axiosInstance.post(`${BASE_URL}/promo-code/active/${id}`,{active: newState},
            { headers: { Authorization: `Bearer ${token}` } },
          ).then((response) => {
            if(response.data.active)
              toast.success("Promocode activated successfully!");
            else
              toast.success("Promocode deactivated successfully!");
          });
          setIsActive(newState);
        } catch (error) {
          toast.error("Promocode not activated successfully!");
          console.error("Error toggling user active state:", error);
        }
      };

      return (        
        <span>          
          <Switch
            value={isActive}
            onChange={() => toggleActive(row.original.promocodeId)}
          />
        </span>
      );
    },
  },
  {
    Header: "Action",
    accessor: "action",
    Cell: ({ row }) => (
      <div className="flex space-x-3 rtl:space-x-reverse">
        <Tooltip content="Edit" placement="top" arrow animation="shift-away">
          
          <button className="action-btn" type="button" onClick={() => openEditModal(row.original)}>
            <Icon icon="heroicons:pencil-square" />
          </button>
        </Tooltip>
        <Tooltip content="Delete" placement="top" arrow animation="shift-away" theme="danger">
          <button
            className="action-btn"
            type="button"
            onClick={() => deleteUser(row.original)}
          >
            <Icon icon="heroicons:trash" />
          </button>
        </Tooltip>
      </div>
    ),
  },
];

const PromocodeList = () => {
  const [loading, setLoading] = useState(true);
  const [procodeList, setprocodeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState();
  const { deleted, ...promoCodeData } = selectedPromoCode || {};
  const [pagesizedata, setpagesizedata]=useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const maxPagesToShow = 5;

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {      
      setLoading(true);
      axiosInstance.get(`${BASE_URL}/promo-code/get-all?page=${currentPage}&size=${pagesizedata}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setprocodeList(response.data);
          setTotalCount(Number(response.headers["x-total-count"])); 
          setPageCount(Math.ceil(Number(response.headers["x-total-count"]) / pagesizedata)); 
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        })
        .finally(() => {
          setLoading(false); 
        });
    }
  }, [currentPage,pagesizedata]);

  const deletePromocode = async (id) => {
    const token = localStorage.getItem("jwtToken");
    try {
      await axiosInstance.delete(`${BASE_URL}/promo-code/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((response) => {
        toast.success("Promocode deleted successfully!");
      });
      setprocodeList((prevList) => prevList.filter((item) => item.promocodeId !== id));
    } catch (error) {
      toast.error("Promocode not delted successfully!");
      console.error("Error deleting promocode:", error);
    }
  };

  
  const deleteUser = async (promocode) => {
    setSelectedPromoCode(promocode);
    setIsDeleteModal(true);
  };

  
  const openEditModal =  async (promoCode) => {
    setSelectedPromoCode(promoCode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPromoCode(null);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPromoCode((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChangepublicShown = (e) => {
    const { value,checked } = e.target;
    setSelectedPromoCode(prevDetails => ({
        ...prevDetails,
        publicShown: checked
    }));
  };
  const formatDateToDatetimeLocal = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString('en-GB', options).replaceAll('/', '-'); 
    const formattedTime = new Date(date).toLocaleTimeString('en-GB', { hour12: false });
    return `${formattedDate} ${formattedTime}`;
  };
  
  

  const editPromodecode = async (id) => {
    try {
      
      const token = localStorage.getItem("jwtToken");
      const formattedStartDate = formatDate(selectedPromoCode?.startDate);
      const formattedExpireDate = formatDate(selectedPromoCode?.expireDate);
      
      if( promoCodeData?.amount == '' || promoCodeData?.amount == undefined){
        toast.error("The promo code cannot be updated without a discount amount!");
        return
      }
       
      await axiosInstance.post(`${BASE_URL}/promo-code/update/${id}`, 
        {
          active: promoCodeData?.active,
          amount: promoCodeData?.amount,
          expireDate: formattedExpireDate,
          promoCode: promoCodeData?.promoCode,
          promoCodeType:promoCodeData?.promoCodeType,
          promocodeId: promoCodeData?.promocodeId,
          startDate: formattedStartDate,
          publicShown: promoCodeData?.publicShown
       }, 
       {
        headers: {
          Authorization: `Bearer ${token}`,
        },
       }
      ).then((response) => {
        toast.success("Promocode Updated successfully!");
       });
      setprocodeList(prevPromoCodes => 
        procodeList.map(promoCode =>
          promoCode.promocodeId === id ? { ...promoCode, ...promoCodeData } : promoCode
        )
      );
    } catch (error) {
      toast.error("Promocode not updated successfully!");
      console.error("Error updating promocode:", error);
    }
  };
  

  //const columns = useMemo(() => COLUMNS(deletePromocode), []);
  const columns = useMemo(() => COLUMNS(deleteUser, openEditModal), []);

  const data = useMemo(() => procodeList, [procodeList]);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 10,
        pageIndex: currentPage,
      },
      manualPagination: true,
      pageCount,
    },
    useSortBy,
    usePagination,
    useRowSelect
  );

  const { getTableProps, getTableBodyProps, headerGroups, page, nextPage, previousPage, canNextPage, canPreviousPage, pageOptions, state, gotoPage, setPageSize, prepareRow } = tableInstance;

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
      <ToastContainer />
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Promocode List</h4>
          <Link to="/add-promocode" className="btn btn-dark">Add Promocode</Link>
        </div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center w-100">
                <Loading />
              </div>
              ): (
                <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                {...getTableProps()}
              >
                <thead className="bg-slate-200 dark:bg-slate-700">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps()}
                          scope="col"
                          className="table-th"
                        >
                          {column.render("Header")}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                  {...getTableBodyProps()}
                >
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          return (
                            
                            <td {...cell.getCellProps()} className="table-td">
                              
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              )}
              
            </div>
          </div>
        </div>
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <select
              className="form-control py-2 w-max"
              value={pagesizedata}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {[10, 25, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page{" "}
              <span>
                {pageIndex + 1} of {pageCount}
              </span>
            </span>
          </div>
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            {totalCount > pagesizedata && (
              <>
                {/* First Page Button */}
                <li>
                  <button
                    onClick={() => gotoPage(0)}
                    disabled={currentPage === 0}
                    className={currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <Icon icon="heroicons:chevron-double-left-solid" />
                  </button>
                </li>

                {/* Previous Page Button */}
                <li>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    Prev
                  </button>
                </li>

                {/* Page Numbers */}
                {(() => {
                  const totalPages = pageCount; // Total number of pages
                  const currentGroup = Math.floor(currentPage / maxPagesToShow); // Current group of pages
                  const startPage = currentGroup * maxPagesToShow; // Starting page of the current group
                  const endPage = Math.min(startPage + maxPagesToShow, totalPages); // Ending page of the current group

                  return (
                    <>
                      {/* Previous dots */}
                      {startPage > 0 && (
                        <li>
                          <button onClick={() => setCurrentPage(startPage - 1)}>
                            ...
                          </button>
                        </li>
                      )}

                      {/* Render page numbers */}
                      {pageOptions.slice(0, 10).map((page, pageIdx) => (
                        <li key={pageIdx}>
                          <button
                            href="#"
                            aria-current="page"
                            className={` ${pageIdx === pageIndex
                              ? "bg-scooton-900 dark:bg-slate-600  dark:text-slate-200 text-white font-medium "
                              : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900  font-normal  "
                              }    text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                            onClick={() => gotoPage(pageIdx)}
                          >
                            {page + 1}
                          </button>
                        </li>
                      ))}

                      {/* Next dots */}
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

                {/* Next Page Button */}
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
           
      {isModalOpen && (       
      
      <Modal
        activeModal={isModalOpen}
        uncontrol
        className="max-w-5xl"
        footerContent={
          <Button
            text="Update"
            className="btn-dark"
            onClick={() => {
              editPromodecode(selectedPromoCode?.promocodeId);
              setIsModalOpen(false);
            }}
          />
        }
        centered
        onClose={() => setIsModalOpen(false)}
      >
          <form>
            <div className="row">
              <div className="col-md-6 mb-4">
                <label className="form-label mb-1">Promo Code</label>
                <input
                  id="promoCode"
                  type="text"
                  className="form-control"
                  name="promoCode"
                  value={promoCodeData?.promoCode || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-4">
                <label className="form-label mb-1">Discount</label>
                <input
                  id="amount"
                  type="text"
                  name="amount"
                  className="form-control"
                  value={promoCodeData?.amount || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-12 mb-4">
                <label htmlFor="promoCodeType" className="form-label">
                  Select Promocode Type
                </label>
                <select
                  className="form-control py-2 form-select h-50"
                  id="promoCodeType"
                  name="promoCodeType"
                  value={promoCodeData?.promoCodeType || ""}
                  onChange={handleInputChange}
                >
                  {promocodeType.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-4">
                <label className="form-label mb-1">Start Date</label>
                <input
                  id="startDate"
                  type="datetime-local"
                  name="startDate"
                  className="form-control"
                  value={promoCodeData?.startDate ? formatDateToDatetimeLocal(promoCodeData.startDate) : ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-4">
                <label className="form-label mb-1">Expiry Date</label>
                <input
                  id="expireDate"
                  type="datetime-local"
                  name="expireDate"
                  className="form-control"
                  value={promoCodeData?.expireDate ? formatDateToDatetimeLocal(promoCodeData.expireDate) : ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id={promoCodeData.publicShown}
                checked={promoCodeData?.publicShown}
                onChange={handleInputChangepublicShown}
              />
            </div>
          </form>
        </Modal>
      
      )}
      {isDeleteModal && (
        <Modal
          activeModal={isDeleteModal}
          uncontrol
          className="max-w-md"
          title=""
          centered
          onClose={() => setIsDeleteModal(false)}
        >
          <div className="">
            <h5 className="text-center">Are you sure to delete</h5>
            <div className="d-flex gap-2 justify-content-center mt-4">
              <Button className="btn btn-dark" type="button" onClick={() => setIsDeleteModal(false)}>
                No
              </Button>
              <Button className="btn btn-outline-light" type="button" onClick={() => { deletePromocode(selectedPromoCode?.promocodeId); setIsDeleteModal(false) }}>
                Yes
              </Button>
            </div>
          </div>
        </Modal>

      )}
    </>
  );
};

export default PromocodeList;
