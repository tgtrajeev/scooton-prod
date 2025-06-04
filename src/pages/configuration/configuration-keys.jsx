import React, { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { useTable, useRowSelect, useSortBy, usePagination } from "react-table";
import Card from "../../components/ui/Card";
import { BASE_URL } from "../../api";
import Tooltip from "@/components/ui/Tooltip";
import Loading from "../../components/Loading";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../../api";
import Modal from "@/components/ui/Modal"; // Assuming you have Modal component

const ConfigurationKeys = () => {
  const [loading, setLoading] = useState(true);
  const [roleList, setRoleList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pagesizedata, setpagesizedata] = useState(10);
  const [editedValues, setEditedValues] = useState({});
  const [isEditModal, setIsEditModal] = useState(false); // State for modal visibility
  const [modalKeyName, setModalKeyName] = useState(""); // State for modal Key Name
  const [modalKeyValue, setModalKeyValue] = useState(""); // State for modal Key Value

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

  // Handle input change for Key Value
  const handleKeyValueChange = (newValue) => {
    setModalKeyValue(newValue);
  };

  // Handle save button click to update only Key Value
  const handleSaveKeyValue = async () => {
    const token = localStorage.getItem("jwtToken");
    const updatedValue = modalKeyValue; // This is the value from the modal input
    const keyName = modalKeyName; // This is the key name you're updating

    if (!updatedValue || !keyName) {
      toast.error("Missing key name or value");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `${BASE_URL}/api/v1/config`,
        {
          keyName: keyName, // keyName remains the same, you're only updating keyValue
          keyValue: updatedValue, // The value being updated for the keyName
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
          item.keyName === keyName ? { ...item, keyValue: updatedValue } : item
        )
      );
      setIsEditModal(false); // Close the modal
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
        const { keyValue } = row.original;
        return <span>{keyValue}</span>; // Displaying the Key Value normally, no input
      },
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
                setModalKeyName(row.original.keyName); // Set key name to modal (readonly)
                setModalKeyValue(row.original.keyValue); // Set key value to modal (editable)
                setIsEditModal(true); // Open modal
              }}
            >
              <Icon icon="heroicons:paper-airplane" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ], []);

  const tableInstance = useTable(
    {
      columns,
      data: roleList,
      initialState: {
        pageIndex: currentPage, // initial page index
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
    state, // The state object contains pageIndex
    gotoPage,
  } = tableInstance;

  const { pageIndex } = state; // Correctly accessing pageIndex from state

  const handlePageSizeChange = (newSize) => {
    setpagesizedata(newSize);
    setCurrentPage(0);
  };

  useEffect(() => {
    setCurrentPage(pageIndex); // Ensure currentPage is updated correctly with pageIndex
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
      </Card>

      {/* Modal for editing key value */}
      <Modal
        activeModal={isEditModal}
        uncontrol
        className="max-w-2xl"
        title="Edit Key Value"
        onClose={() => setIsEditModal(false)}
        centered
      >
        <div>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
            <div>
              <label className="block font-medium mb-1">Key Name</label>
              <input
                className="w-full border px-3 py-2 rounded dark:bg-slate-700 dark:text-white"
                type="text"
                value={modalKeyName}
                readOnly // Make keyName readonly (cannot edit)
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Key Value</label>
              <input
                className="w-full border px-3 py-2 rounded dark:bg-slate-700 dark:text-white"
                type="text"
                value={modalKeyValue}
                onChange={(e) => handleKeyValueChange(e.target.value)} // Allow value update
              />
            </div>
          </div>
          <hr className="mt-3" />
          <div className="d-flex gap-2 justify-content-end mt-6">
            <button className="btn btn-dark" type="button" onClick={handleSaveKeyValue}>
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConfigurationKeys;
