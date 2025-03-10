import React, { useState, useMemo, useEffect, useCallback } from "react";
import Icon from "@/components/ui/Icon";
import { useTable, useRowSelect, useSortBy, usePagination } from "react-table";
import Card from "../../components/ui/Card";
import { BASE_URL } from "../../api";
import Tooltip from "@/components/ui/Tooltip";
import Loading from "../../components/Loading";
import Modal from "../../components/ui/Modal";
import Button from "@/components/ui/Button";
import TextField from "@mui/material/TextField";
import Select from "@/components/ui/Select";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import axiosInstance from "../../api";

const roleDisplayNames = {
  "ROLE_SUPER_ADMIN": "Super Admin",
  "ROLE_EDITOR": "Viewer",
  "ROLE_CITY_ADMIN": "Admin",
};
const COLUMNS = (openEditRole, deleteUser) => [
  {
    Header: "Sr. No.",
    accessor: (row, i) => i + 1,
  },
  {
    Header: "User Name",
    accessor: "first_name",
  },
  {
    Header: "Last Name",
    accessor: "last_name",
  },
  {
    Header: "Phone Number",
    accessor: "mobile_number",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Role",
    accessor: "role",
    Cell: ({ value }) => roleDisplayNames[value] || value,
  },
  {
    Header: "Action",
    accessor: "action",
    Cell: (row) => {
      return (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tooltip content="Edit" placement="top" arrow animation="shift-away">
            <button className="action-btn" type="button" onClick={() => openEditRole(row.row.original)}>
              <Icon icon="heroicons:pencil-square" />
            </button>
          </Tooltip>
          <Tooltip
            content="Delete"
            placement="top"
            arrow
            animation="shift-away"
            theme="danger"
          >
            <button className="action-btn" type="button" onClick={() => deleteUser(row.row.original)}>
              <Icon icon="heroicons:trash" />
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];

const RoleList = () => {
  const [loading, setLoading] = useState(true);
  const [roleList, setRoleList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState();
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selectedUDeleteserDetails, setSelectedDeleteUserDetails] = useState();
  const [roleOptions, setRoleOptions] = useState([]);
  const [pagesizedata, setpagesizedata]=useState(10)

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setLoading(true);
      axiosInstance
        .get(
          `${BASE_URL}/register/admins/get-all?page=${currentPage}&size=${pagesizedata}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          
          setRoleList(response.data); 
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

    axiosInstance
      .get(`${BASE_URL}/register/get-all-roles`)
      .then((response) => {
        const roles = response.data.map((role) => {
          let label;
          switch (role) {
            case "ROLE_SUPER_ADMIN":
              label = "Super Admin";
              break;
            case "ROLE_CITY_ADMIN":
              label = "Admin";
              break;
            case "ROLE_EDITOR":
              label = "Viewer";
              break;
            default:
              label = role;
          }
          return { value: role, label };
        });
        setRoleOptions(roles);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
      });
  }, []);

  // const columns = useMemo(() => COLUMNS, []);

  const openEditRole = async (userdetails) => {
    setSelectedUserDetails(userdetails);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserDetails(null);
  };

  const deleteUser = async (userdetails) => {
    setSelectedDeleteUserDetails(userdetails);
    setIsDeleteModal(true);
  };

  const closeUserModel = () => {
    setIsDeleteModal(false);
    setSelectedDeleteUserDetails(null);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUserDetails((prev) => ({ ...prev, [name]: value }));
  };
  const handleInputChangerole = (e) => {
    const { value } = e.target;
    setSelectedUserDetails(prevDetails => ({
      ...prevDetails,
      role: value
    }));
  };


  const deleteRole = async (id) => {
    try {
      await axiosInstance.delete(`${BASE_URL}/register/admin/delete/${id}`).then((response) => {
        toast.success("Role deleted successfully!");
      });
      setRoleList((prevList) => prevList.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting promocode:", error);
    }
  }

  const editRoleDetails = async (id) => {
    try {
      await axiosInstance.post(`${BASE_URL}/register/admin/update/${id}`, {
        firstName: selectedUserDetails.first_name,
        lastName: selectedUserDetails.last_name,
        mobileNumber: selectedUserDetails.mobile_number,
        password: selectedUserDetails.password,
        role: selectedUserDetails.role,
        email: selectedUserDetails.email,
        service_id: null
      }).then((response) => {
        toast.success("Role updated successfully!");
      });

      setRoleList(prevPromoCodes =>
        roleList.map(role =>
          role.id === id ? { ...role, ...selectedUserDetails } : role
        )
      );
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/");
        toast.error("Unauthorized. Please log in again.");
      } else {
        if(error.response.data.error == 'Password is must'){
        toast.error('Password is required');
        } else if(error.response.data.error == "Name can't be empty"){
        toast.error('First name required');
        } else if(selectedUserDetails.mobile_number ==''){
        toast.error('Phone number is required');
        }
        else if(error.response.data.error == "Wrong phone number"){
        toast.error('Phone number must be 10 digit');
        }
       
      }
      
    };
  }
  const columns = useMemo(() => COLUMNS(openEditRole, deleteUser), []);

  const data = useMemo(() => roleList, [roleList]);

  const tableInstance = useTable(
    {
      columns,
      data: roleList, 
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
      <ToastContainer />
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Role List</h4>
          <Link to="/add-role" className="btn btn-dark">Add Role</Link>
        </div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center w-100">
                  <Loading />
                </div>
              ) : (
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
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <select
              className="form-control py-2 w-max"
              value={pagesizedata}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {[10,20,30,40, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
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
                onClick={() => {setCurrentPage(currentPage - 1)}}
                disabled={currentPage === 0}
                className={currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}
              >
                Prev
              </button>
              </li>
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
              <li>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= pageCount - 1}
                className={currentPage >= pageCount - 1 ? "opacity-50 cursor-not-allowed" : ""}
              >
                Next
              </button>
              </li>
              <li>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={currentPage >= pageCount - 1}
                className={currentPage >= pageCount - 1 ? "opacity-50 cursor-not-allowed" : ""}
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
                editRoleDetails(selectedUserDetails?.id);
                setIsModalOpen(false);
              }}
            />
          }
          centered
          onClose={() => setIsModalOpen(false)}
        >
          <form className="space-y-4 mt-4">
            <div className="row">
              <div className="col-md-6 mb-4">
                <label className="form-label">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="first_name"
                  className="form-control"
                  value={selectedUserDetails?.first_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-4">
                <label className="form-label">Last Name</label>
                <input
                  id="lastname"
                  type="text"
                  name="last_name"
                  className="form-control"
                  value={selectedUserDetails?.last_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-4">
                <label className="form-label">Mobile Number</label>
                <input
                  id="mobileNumber"
                  type="number"
                  name="mobile_number"
                  className="form-control"
                  value={selectedUserDetails?.mobile_number || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-4">
                <label className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-control"
                  value={selectedUserDetails?.email || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-4">
                <label className="form-label">Password</label>
                <input
                  id="password"
                  type="text"
                  name="password"
                  className="form-control"
                  value={selectedUserDetails?.password || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-4">
                <label className="form-label">Select Role</label>
                <Select
                  id="role"
                  options={roleOptions}
                  value={selectedUserDetails?.role || ""}
                  onChange={handleInputChangerole}
                />
              </div>
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
              <Button className="btn btn-outline-light" type="button" onClick={() => { deleteRole(selectedUDeleteserDetails?.id); setIsDeleteModal(false) }}>
                Yes
              </Button>
            </div>
          </div>
        </Modal>

      )}
    </>
  );
};

export default RoleList;
