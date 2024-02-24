import { useEffect, useState } from "react";
import { useTable, usePagination } from "react-table";
import { useForm } from "react-hook-form";
import Header from "../../components/header";
import { getNewOrUpdatedRows } from "../../data-utils";
import styles from "./interactive-table.module.css";
import classNames from "classnames";
import PropTypes from "prop-types";
import CSVUpload from "../csv-upload";

// TODO: move test data to a /fixtures directory
const testColumns = [
  {
    Header: "First Name",
    accessor: "firstName",
  },
  {
    Header: "Last Name",
    accessor: "lastName",
  },
  {
    Header: "Age",
    accessor: "age",
  },
  {
    Header: "Visits",
    accessor: "visits",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Profile Progress",
    accessor: "progress",
  },
];

let testData = [
  {
    firstName: "committee-c15dw",
    lastName: "editor-ktsjo",
    age: 3,
    visits: 46,
    progress: 75,
    status: "relationship",
  },
  {
    firstName: "midnight-wad0y",
    lastName: "data-7h4xf",
    age: 1,
    visits: 56,
    progress: 15,
    status: "complicated",
  },
  {
    firstName: "tree-sbdb0",
    lastName: "friendship-w8535",
    age: 1,
    visits: 45,
    progress: 66,
    status: "single",
  },
  {
    firstName: "chin-borr8",
    lastName: "shirt-zox8m",
    age: 0,
    visits: 25,
    progress: 67,
    status: "complicated",
  },
  {
    firstName: "women-83ef0",
    lastName: "chalk-e8xbk",
    age: 9,
    visits: 28,
    progress: 23,
    status: "relationship",
  },
];

function nextRowId(data) {
  if (!data.length) {
    return 0;
  }
  const maxId = data.reduce((acc, item) => {
    let max = acc;

    if (item.id && parseInt(item.id) > max) {
      max = parseInt(item.id);
    }
    return max;
  }, 0);

  return maxId + 1;
}

export default function InteractiveTable({
  title,
  columns,
  hiddenColumns,
  data,
  onSave,
  saveError,
  allowRowPreprend,
  onUpload,
  uploadError,
}) {
  const [tableData, setTableData] = useState(data); // small bug, when data is saved, useEffect must set table data to store data and preserve table page

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: {
        pageIndex: 0,
        pageSize: 5,
        hiddenColumns: ["id"].concat(hiddenColumns),
      }, // hidden columns don't call cell.render()
    },
    usePagination
  );

  const { pageIndex, pageSize } = state;

  const { register, handleSubmit, formState, control, setValue, getValues } =
    useForm({
      defaultValues: allowRowPreprend ? {} : { rows: tableData },
    });

  const { dirtyFields } = formState;

  function handleSave(formData) {
    const newOrUpdatedRows = getNewOrUpdatedRows(
      formData.rows,
      dirtyFields.rows
    );
    onSave(newOrUpdatedRows);
  }

  function handlePrependRow() {
    // copy the keys of the first row of data or the columns if there is no data
    let newRow = {};

    if (tableData.length) {
      newRow = { ...tableData[0] };
      for (let key in newRow) {
        newRow[key] = null;
      }
    } else {
      columns.forEach((column) => {
        const key = column?.accessor;
        if (key) {
          newRow[key] = null;
        }
      });
    }

    const nextId = nextRowId(tableData);
    newRow.id = nextId;
    newRow.isNew = true;

    setValue(`rows.${nextId}`, newRow);
    setTableData((prevTableData) => [newRow, ...prevTableData]);
  }

  function setRowData(id, fieldName, value) {
    const index = tableData.findIndex((row) => row.id === id);
    if (index !== -1) {
      const newTableData = [
        ...tableData.slice(0, index),
        { ...tableData[index], [fieldName]: value },
        ...tableData.slice(index + 1),
      ];
      setTableData(newTableData);
    }
  }

  useEffect(() => {
    if (allowRowPreprend) {
      // set the id of each row since hiding the id column removes the ids from the form data
      tableData.forEach((item) => {
        // check first if row doesn't have id
        const row = getValues(`rows.${item.id}`);
        if (!row?.id) {
          setValue(`rows.${item.id}.id`, item.id);
        }
        if (item.isNew) {
          setValue(`rows.${item.id}.isNew`, item.isNew);
        }
      });
    }
  }, [tableData]);

  return (
    <div>
      <Header>{title}</Header>
      <div className={styles.toolbar}>
        <div>
          {onUpload && (
            <CSVUpload title={`${title} Upload`} onSubmit={onUpload} />
          )}
        </div>
        <div>
          {allowRowPreprend && (
            <button
              style={{ marginRight: 10 }}
              className="btn btn-primary"
              onClick={handlePrependRow}
            >
              Add Row
            </button>
          )}
          <button
            className={classNames("btn", "btn-primary", {
              ["btn-danger"]: saveError,
            })}
            onClick={handleSubmit(handleSave)}
          >
            Save
          </button>
        </div>
      </div>
      <hr className={styles.underline} />
      <table className="interactive-table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr key={i} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, j) => (
                <th
                  key={j}
                  {...column.getHeaderProps()}
                  style={{ paddingLeft: 3, paddingRight: 3 }}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr key={i} {...row.getRowProps()}>
                {row.cells.map((cell, j) => {
                  return (
                    <td
                      key={j}
                      {...cell.getCellProps()}
                      style={{ fontSize: 16, paddingLeft: 3, paddingRight: 3 }}
                    >
                      {cell.render("Cell", {
                        register,
                        control,
                        setValue,
                        getValues,
                        setRowData,
                      })}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <ul className="pagination">
        <li
          className="page-item"
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
        >
          <a className="page-link">First</a>
        </li>
        <li
          className="page-item"
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        >
          <a className="page-link">{"<"}</a>
        </li>
        <li
          className="page-item"
          onClick={() => nextPage()}
          disabled={!canNextPage}
        >
          <a className="page-link">{">"}</a>
        </li>
        <li
          className="page-item"
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        >
          <a className="page-link">Last</a>
        </li>
        <li>
          <a className="page-link">
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{" "}
          </a>
        </li>
        <li>
          <a className="page-link">
            <input
              className="form-control"
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: "100px", height: "20px" }}
            />
          </a>
        </li>{" "}
        <select
          className="form-control"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
          style={{ width: "120px", height: "38px" }}
        >
          {[5, 10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </ul>
    </div>
  );
}

InteractiveTable.propTypes = {
  title: PropTypes.string,
  columns: PropTypes.arrayOf({}),
  hiddenColumns: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.arrayOf({}),
  onSave: PropTypes.func,
  saveError: PropTypes.string,
  onUpload: PropTypes.func,
  uploadError: PropTypes.string,
  allowRowPreprend: PropTypes.bool,
};

InteractiveTable.defaultProps = {
  title: "",
  columns: testColumns,
  hiddenColumns: [],
  data: testData,
  onSave: () => {},
  saveError: "",
  onUpload: undefined,
  uploadError: "",
  allowRowPreprend: false,
};
