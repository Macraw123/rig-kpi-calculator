import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";

import { useTable } from "react-table";
import { useState } from "react";
import { useEffect } from "react";

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData,
}) => {
  const [value, setValue] = useState(initialValue);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const onChecked = (e) => {
    setValue(e.target.checked);
  };

  const onBlur = () => {
    updateMyData(index, id, value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (id === "Deadline") {
    return (
      <input
        type="checkbox"
        checked={value}
        onChange={onChecked}
        onBlur={onBlur}
      />
    );
  } else if (id === "ExtendedDate") {
    return (
      <input type="date" value={value} onChange={onChange} onBlur={onBlur} />
    );
  } else if (id === "ExtensionReason") {
    return (
      <input type="text" value={value} onChange={onChange} onBlur={onBlur} />
    );
  }
  if (!initialValue) {
    return "";
  }
  return value;
};

const defaultColumn = {
  Cell: EditableCell,
};

const InteractiveTable = (props) => {
  const data = React.useMemo(() => props.data, [props.data]);
  const columns = React.useMemo(() => props.columns, [props.columns]);
  const updateMyData = React.useMemo(
    () => props.updateMyData,
    [props.updateMyData]
  );

  const tableInstance = useTable({
    columns,
    data,
    updateMyData,
    defaultColumn,
  });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  // Render the UI for your table
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover" {...getTableProps()}>
        <thead className="table-dark">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InteractiveTable;
