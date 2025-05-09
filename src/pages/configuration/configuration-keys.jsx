import React, { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { useTable, useRowSelect, useSortBy, usePagination } from "react-table";
import Card from "../../components/ui/Card";
import { BASE_URL } from "../../api";
import Tooltip from "@/components/ui/Tooltip";
import Loading from "../../components/Loading";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../../api";

const ConfigurationKeys = () => {
  const [loading, setLoading] = useState(true);
  const [roleList, setRoleList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pagesizedata, setpagesizedata] = useState(10);
  const [editedValues, setEditedValues] = useState({});

  // Fetch config keys
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setLoading(true);
      axiosInstance
        .get(`${BASE_URL}/api/v1/config`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Handle input change
  const handleKeyValueChange = (id, newValue) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  // Handle save button click
  const handleSaveKeyValue = async (row) => {
    const token = localStorage.getItem("jwtToken");
    const id = row.original.id;
    const keyName = row.original.keyName;
    const updatedValue = editedValues[id];

    if (!updatedValue || !keyName) {
      toast.error("Missing key name or value");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `${BASE_URL}/api/v1/config`,
        {
          keyName,
          keyValue: updatedValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Value updated successfully!");

      // Optionally refresh data
      setRoleList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, keyValue: updatedValue } : item
        )
      );
      setEditedValues((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update key value");
    }
  };

  // Table columns
  const columns = useMemo(() => [
    {
      Header: "Sr. No.",
      accessor: (row, i) => i + 1,
    },
    {
      Header: "Key Name",
      accessor: "keyName",
    },
    {
      Header: "Key Description",
      accessor: "keyDescription",
    },
    {
      Header: "Key Value",
      accessor: "keyValue",
      Cell: ({ row }) => {
        const id = row.original.id;
        return (
          <input
            type="text"
            className="form-control"
            value={editedValues[id] ?? row.original.keyValue}
            onChange={(e) => handleKeyValueChange(id, e.target.value)}
          />
        );
      },
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tooltip content="Save" placement="top" arrow animation="shift-away">
            <button
              className="action-btn"
              type="button"
              onClick={() => handleSaveKeyValue(row)}
            >
              <Icon icon="heroicons:paper-airplane" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ], [editedValues]);

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
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    prepareRow,
  } = tableInstance;

  const { pageIndex } = state;

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
          <h4 className="card-title">Configuration Keys</h4>
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

        {/* <div className="md:flex justify-between mt-6 items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <select
              className="form-control py-2 w-max"
              value={pagesizedata}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page {pageIndex + 1} of {pageCount}
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
                {pageOptions.slice(0, 10).map((page, idx) => (
                  <li key={idx}>
                    <button
                      className={`${
                        idx === pageIndex
                          ? "bg-scooton-900 text-white"
                          : "bg-slate-100 text-slate-900"
                      } text-sm rounded h-6 w-6 flex items-center justify-center`}
                      onClick={() => gotoPage(idx)}
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
        </div> */}
      </Card>
    </>
  );
};

export default ConfigurationKeys;
