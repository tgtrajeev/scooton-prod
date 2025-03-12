import React, { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import { BASE_URL } from "../../../api";
import axiosInstance from "../../../api";

const COLUMNS = [
  {
    Header: "Order Id",
    accessor: "orderId",
  },
  {
    Header: "Mobile Name",
    accessor: "userInfo.firstName",
  },
  {
    Header: "Amount",
    accessor: "totalAmount",
  },
  {
    Header: "Status",
    accessor: "orderStatus",
    Cell: ({ value }) => {
      const statusText = value ? "Completed" : "";
      return (
        <span className={`block w-full`}>
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 text-success-500 bg-success-500`}
          >
            {statusText}
          </span>
        </span>
      );
    },
  },
  {
    Header: "Address",
    accessor: "addressDetails.addressLine1",
  },
];

const RecentCompletedOrders = () => {
  const[orderData, setOrderData] = useState([]);
  useEffect(() => {
    const fetchOrderData = async () => {
      const token = localStorage.getItem("jwtToken");
      try {      
        const responseDelivered = await axiosInstance.post(`${BASE_URL}/order-history/orders/94753`,{ type: "DELIVERED" }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrderData(responseDelivered.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } 
    };
    fetchOrderData();
  }, []);
  const columns = useMemo(() => COLUMNS, []);
  const tableInstance = useTable(
    {
      columns,
      data: orderData,
      initialState: {
        pageSize: 10,
      },
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


  return (
    <>
      <div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
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
            </div>
          </div>
        </div>
        <div className="md:flex md:space-y-0 space-y-5 justify-center mt-6 items-center">
          <ul className="flex items-center  space-x-3  rtl:space-x-reverse">
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={` ${
                  !canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <Icon icon="heroicons-outline:chevron-left" />
              </button>
            </li>
            {pageOptions.map((page, pageIdx) => (
              <li key={pageIdx}>
                <button
                  href="#"
                  aria-current="page"
                  className={` ${
                    pageIdx === pageIndex
                      ? "bg-scooton-900 dark:bg-slate-600  dark:text-slate-200 text-white font-medium "
                      : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900  font-normal  "
                  }    text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                  onClick={() => gotoPage(pageIdx)}
                >
                  {page + 1}
                </button>
              </li>
            ))}
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={` ${
                  !canNextPage ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                <Icon icon="heroicons-outline:chevron-right" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default RecentCompletedOrders;
