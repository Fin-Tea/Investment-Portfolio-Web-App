import { useTable, usePagination, useBlockLayout } from "react-table";
import { useSticky } from "react-table-sticky";
import styled from "styled-components";
import PropTypes from "prop-types";

const Styles = styled.div`
  overflow: auto;
  .table {
    border: 1px solid #ddd;
    border-top: none;
    margin-bottom: 0;

    .tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
    }

    .th,
    .td {
      padding: 5px;
      border-bottom: 1px solid #ddd;
      border-right: 1px solid #ddd;
      border-left: 1px solid #ddd;
      background-color: #fff;
      overflow: hidden;

      :last-child {
        border-right: 0;
      }
    }

    .th {
      font-weight: 500;
    }

    &.sticky {
      overflow: scroll;
      .header,
      .footer {
        position: sticky;
        z-index: 1;
        width: fit-content;
      }

      .header {
        top: 0;
        box-shadow: 0px 3px 3px #ccc;
      }

      .footer {
        bottom: 0;
        box-shadow: 0px -3px 3px #ccc;
      }

      .body {
        position: relative;
        z-index: 0;
      }

      [data-sticky-td] {
        position: sticky;
      }

      [data-sticky-last-left-td] {
        box-shadow: 2px 0px 3px #ccc;
      }

      [data-sticky-first-right-td] {
        box-shadow: -2px 0px 3px #ccc;
      }
    }
  }
`;

export default function BasicTable({
  className,
  columns,
  hiddenColumns,
  data,
  rowsPerPage,
}) {
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
      data,
      initialState: {
        pageIndex: 0,
        pageSize: rowsPerPage,
        hiddenColumns: ["id"].concat(hiddenColumns),
      }, // hidden columns don't call cell.render()
    },
    useBlockLayout,
    usePagination,
    useSticky
  );

  const { pageIndex, pageSize } = state;

  return (
    <div className={`border-t ${className}`}>
      <Styles style={{ height: "100%" }}>
        <div
          {...getTableProps()}
          className="table sticky"
          style={{ width: 800, height: 400, border: "none" }}
        >
          <div className="header">
            {headerGroups.map((headerGroup) => (
              <div {...headerGroup.getHeaderGroupProps()} className="tr">
                {headerGroup.headers.map((column) => (
                  <div {...column.getHeaderProps()} className="th">
                    {column.render("Header")}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div {...getTableBodyProps()} className="body">
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <div {...row.getRowProps()} className="tr">
                  {row.cells.map((cell) => {
                    return (
                      <div {...cell.getCellProps()} className="td">
                        {cell.render("Cell")}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Styles>
      <div className="my-0">
        {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
        <ul className="pagination flex-wrap mb-0">
          <li
            className="page-item mb-1"
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            <a className="page-link !text-purple-800 text-base !rounded-l-md">
              First
            </a>
          </li>
          <li
            className="page-item"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            <a className="page-link !text-purple-800 text-base">{"<"}</a>
          </li>
          <li
            className="page-item"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            <a className="page-link !text-purple-800 text-base">{">"}</a>
          </li>
          <li
            className="page-item"
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            <a className="page-link !text-purple-800 text-base rounded-r-md">
              Last
            </a>
          </li>
          <li>
            <a className="page-link mx-1 !text-purple-800 text-base rounded-md">
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{" "}
            </a>
          </li>
          <li>
            <a className="page-link mr-1 rounded-md mb-2">
              <input
                className="form-control !text-sm !text-purple-800"
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                style={{ width: "100px", height: "25px" }}
              />
            </a>
          </li>{" "}
          <select
            className="form-control !text-purple-800 !text-base rounded-md mb-2"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
            style={{ width: "120px", height: "38px" }}
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option className="text-base" key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </ul>
      </div>
    </div>
  );
}

BasicTable.propTypes = {
  title: PropTypes.string,
  columns: PropTypes.arrayOf({}),
  hiddenColumns: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.arrayOf({}),
  onSave: PropTypes.func,
  saveError: PropTypes.string,
  onUpload: PropTypes.func,
  uploadError: PropTypes.string,
  allowRowPreprend: PropTypes.bool,
  rowsPerPage: PropTypes.number,
};

BasicTable.defaultProps = {
  title: "",
  columns: [],
  hiddenColumns: [],
  data: [],
  onSave: () => {},
  saveError: "",
  onUpload: undefined,
  uploadError: "",
  allowRowPreprend: false,
  rowsPerPage: 30
};
