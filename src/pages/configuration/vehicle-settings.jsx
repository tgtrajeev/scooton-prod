import React, { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { useTable, useRowSelect, useSortBy, usePagination } from "react-table";
import Card from "../../components/ui/Card";
import { BASE_URL } from "../../api";
import Tooltip from "@/components/ui/Tooltip";
import Loading from "@/components/Loading";
import { toast } from "react-toastify";
import axiosInstance from "../../api";
import { Badge } from "react-bootstrap";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const Vehicle_Settings = () => {
  const [loading, setLoading] = useState(true);
  const [roleList, setRoleList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pagesizedata, setpagesizedata] = useState(10);

  const [isEditModal, setIsEditModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalFormValues, setModalFormValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState([]);

  const fieldLabels = {
    type: "Vehicle Type",
    registrationFees: "Platform registration charges",
    imageUrl: "Image URL",
    categoryId: "Vehicle ID",
    platformChargesPercentage: "Platform Charges(%)",
    active: "Is Active",
    isDisplay: "Show in List",
    id: "Vehicle ID",
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setLoading(true);
      axiosInstance
        .get(`${BASE_URL}/api/v1/admin/config/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const { jsonData } = response.data;
          setRoleList(jsonData || []);
          setTotalCount(jsonData.length);
          setPageCount(Math.ceil((jsonData.length || 1) / pagesizedata));
        })
        .catch((error) => {
          console.error("Error fetching config data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentPage, pagesizedata]);

  const columns = useMemo(
    () => [
      {
        Header: "Sr. No.",
        accessor: (row, i) => i + 1,
      },
      {
        Header: "Vehicle ID",
        accessor: "id",
        Cell: ({ value }) => (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value}
          </span>
        )
      },
      {
        Header: "Type",
        accessor: "type",
      },
      {
        Header: "Registration Fees",
        accessor: "registrationFees",
      },
      {
        Header: "Image",
        accessor: "imageUrl",
        Cell: ({ value }) => (
          <img
            src={value}
            alt="Type"
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        ),
      },
      {
        Header: "Category Id",
        accessor: "categoryId",
      },
      {
        Header: "Platform Charges Percentage",
        accessor: "platformChargesPercentage",
      },
      {
        Header: "Status",
        accessor: "active",
        Cell: ({ value }) => (
          <Badge bg={value ? "success" : "danger"}>
            {value ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        Header: "Is Display",
        accessor: "isDisplay",
        Cell: ({ value }) => (
          <Badge bg={value ? "primary" : "secondary"}>
            {value ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <div className="flex space-x-3 rtl:space-x-reverse">
            <Tooltip content="Edit" placement="top" arrow animation="shift-away">
              <button
                className="action-btn"
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setModalFormValues({ ...row.original });
                  setIsEditModal(true);
                  setFieldErrors([]); // Clear errors when opening the modal
                }}
              >
                <Icon icon="heroicons:pencil-square" />
              </button>
            </Tooltip>
          </div>
        ),
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data: roleList,
      initialState: {
        pageIndex: currentPage,
        pageSize: pagesizedata,
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
    prepareRow,
    state,
  } = tableInstance;

  const { pageIndex } = state;

  useEffect(() => {
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  const handleModalSave = async () => {
    // Clear previous errors
    setFieldErrors([]);

    // Validation for required fields
    const errors = [];
    if (!modalFormValues.categoryId) {
      errors.push({ fieldName: "categoryId", fieldError: "Category ID is required" });
    }
    if (!modalFormValues.type) {
      errors.push({ fieldName: "type", fieldError: "Vehicle type is required" });
    }
    if (modalFormValues.platformChargesPercentage === "") {
      errors.push({ fieldName: "platformChargesPercentage", fieldError: "Platform charges percentage is required" });
    }
    if (!modalFormValues.imageUrl) {
      errors.push({ fieldName: "imageUrl", fieldError: "Image URL is required" });
    }
    if (modalFormValues.registrationFees === "") {
      errors.push({ fieldName: "registrationFees", fieldError: "Registration fees is required" });
    }

    if (errors.length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Validation for platform charges fields
    if (modalFormValues.registrationFees < 0) {
      toast.error("Platform registration charges cannot be negative");
      return;
    }

    if (modalFormValues.platformChargesPercentage < 0) {
      toast.error("Platform Charges (%) cannot be negative");
      return;
    }

    if (modalFormValues.platformChargesPercentage > 100) {
      toast.error("Platform Charges (%) cannot exceed 100");
      return;
    }

    try {
      const token = localStorage.getItem("jwtToken");
      await axiosInstance.post(
        `${BASE_URL}/api/v1/admin/config/vehicle`,
        modalFormValues,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        isCreating ? "Vehicle added successfully!" : "Vehicle updated successfully!"
      );

      if (isCreating) {
        setRoleList((prev) => [...prev, modalFormValues]);
      } else {
        setRoleList((prev) =>
          prev.map((item) =>
            item.id === modalFormValues.id ? modalFormValues : item
          )
        );
      }

      setIsEditModal(false);
      setIsCreating(false);
    } catch (error) {
      console.error("Error submitting vehicle config:", error);
      toast.error(error.response.data.details? error.response.data.details : error.response.data.message);
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h4 className="card-title">Vehicle Settings</h4>
          <Button
            className="btn btn-dark"
            type="button"
            onClick={() => {
              setIsCreating(true);
              setModalFormValues({
                type: "",
                registrationFees: "",
                imageUrl: "",
                categoryId: "",
                platformChargesPercentage: "",
                active: true,
                isDisplay: false,
              });
              setIsEditModal(true);
              setFieldErrors([]); // Clear errors when opening the modal
            }}
          >
            + New Vehicle Add
          </Button>
        </div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center w-full py-10">
                  <Loading />
                </div>
              ) : (
                <table
                  className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                  {...getTableProps()}
                >
                  <thead className="bg-slate-200 dark:bg-slate-700">
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps()}
                            className="table-th"
                            key={column.id}
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
                              <td
                                {...cell.getCellProps()}
                                className="table-td"
                                key={cell.column.id}
                              >
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
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        activeModal={isEditModal}
        uncontrol
        className="max-w-2xl"
        title={isCreating ? "Add New Vehicle" : "Vehicle Configuration"}
        onClose={() => {
          setIsEditModal(false);
          setIsCreating(false);
          setFieldErrors([]); // Clear errors when closing the modal
        }}
        centered
      >
        <div>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
            {Object.entries(modalFormValues)
              .filter(([key]) => key !== "isDisplay" && key in fieldLabels)
              .map(([key, value]) => (
                <div key={key}>
                  <label className="block font-medium mb-1">
                    {fieldLabels[key] || key}
                  </label>
                  {key === "active" ? (
                    <select
                      className="w-full border px-3 py-2 rounded dark:bg-slate-700 dark:text-white"
                      value={value ? "true" : "false"}
                      onChange={(e) =>
                        setModalFormValues((prev) => ({
                          ...prev,
                          [key]: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : key === "registrationFees" || key === "platformChargesPercentage" ? (
                    <input
                      className="w-full border px-3 py-2 rounded dark:bg-slate-700 dark:text-white"
                      type="number"
                      value={value}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        if (newValue >= 0 && (key !== "platformChargesPercentage" || newValue <= 100)) {
                          setModalFormValues((prev) => ({
                            ...prev,
                            [key]: newValue,
                          }));
                        }
                      }}
                      disabled={key === "id" || (!isCreating && !["registrationFees", "platformChargesPercentage", "active", "imageUrl", "type"].includes(key))}
                    />
                  ) : (
                    <input
                      className="w-full border px-3 py-2 rounded dark:bg-slate-700 dark:text-white"
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setModalFormValues((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      disabled={key === "id" || (!isCreating && !["registrationFees", "platformChargesPercentage", "active", "imageUrl", "type"].includes(key))}
                    />
                  )}
                  {fieldErrors.some((error) => error.fieldName === key) && (
                    <div className="text-red-600 text-sm">
                      {fieldErrors.find((error) => error.fieldName === key)?.fieldError}
                    </div>
                  )}
                </div>
              ))}
          </div>
          <hr className="mt-3" />
          <div className="d-flex gap-2 justify-content-end mt-6">
            <Button className="btn btn-dark" type="button" onClick={handleModalSave}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Vehicle_Settings;
