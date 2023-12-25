import InteractiveTable from "./interactive-table";
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";

import "react-datepicker/dist/react-datepicker.css";

export default function ImprovementActions({ actions, onSave, saveError }) {
  const columns = [
    {
      Header: "ID",
      accessor: "id",
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ cell, register }) => {
        const { action, id } = cell.row.values;
        const name = `rows.${id}.action`;

        return (
          <input
            style={{ width: "100%" }}
            defaultValue={action}
            title={action}
            {...register(name)}
          />
        );
      },
    },
    {
      Header: "Expected Result",
      accessor: "expectedResult",
      Cell: ({ cell, register }) => {
        const { expectedResult, id } = cell.row.values;
        const name = `rows.${id}.expectedResult`;
        return (
          <input
            style={{ width: "100%" }}
            defaultValue={expectedResult}
            title={expectedResult}
            {...register(name)}
          />
        );
      },
    },
    {
      Header: "Date Started",
      accessor: "startedAt",
      Cell: ({ cell, register, setValue, getValues }) => {
        const { id, startedAt } = cell.row.values;
        const name = `rows.${id}.startedAt`;

        let value = getValues(name);
        value = value ? new Date(value) : null;

        if (!value && startedAt) {
          value = new Date(startedAt);
        }

        return (
          <DatePicker
            {...register(name)}
            selected={value}
            onChange={(date) => {
              setValue(name, date, { shouldDirty: true });
            }}
          />
        );
      },
    },
    {
      Header: "Date Ended",
      accessor: "finishedAt",
      Cell: ({ cell, register, setValue, getValues }) => {
        const { id, finishedAt } = cell.row.values;
        const name = `rows.${id}.finishedAt`;

        let value = getValues(name);
        value = value ? new Date(value) : null;

        if (!value && finishedAt) {
          value = new Date(finishedAt);
        }

        return (
          <DatePicker
            {...register(name)}
            selected={value}
            onChange={(date) => {
              setValue(name, date, { shouldDirty: true });
            }}
          />
        );
      },
    },
    {
      Header: "Immediate Result",
      accessor: "resultImmediate",
      Cell: ({ cell, register }) => {
        const { resultImmediate, id } = cell.row.values;
        const name = `rows.${id}.resultImmediate`;
        return (
          <textarea
            style={{ width: "100%" }}
            defaultValue={resultImmediate}
            title={resultImmediate}
            {...register(name)}
          />
        );
      },
    },
    {
      Header: "30-Day Result",
      accessor: "result30days",
      Cell: ({ cell, register }) => {
        const { result30days, id } = cell.row.values;
        const name = `rows.${id}.result30days`;
        return (
          <textarea
            style={{ width: "100%" }}
            defaultValue={result30days}
            title={result30days}
            {...register(name)}
          />
        );
      },
    },
  ];

  return (
    <InteractiveTable
      title="1% Improvement Actions"
      columns={columns}
      data={actions}
      onSave={onSave}
      saveError={saveError}
      allowRowPreprend={true}
    />
  );
}

ImprovementActions.propTypes = {
  actions: PropTypes.arrayOf({}),
  onSave: PropTypes.func,
  saveError: PropTypes.string,
};

ImprovementActions.defaultProps = {
  actions: [],
  onSave: () => {},
  saveError: "",
};
