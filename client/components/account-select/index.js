import React from "react";
import Select from "react-select";
import useAuth from "../../hooks/auth";
import PropTypes from "prop-types";

export default function AccountSelect({ onChange }) {
  // TODO: Need account names as labels (ids will be values)
  const { user } = useAuth();

  if (user && user.accountLinks.length) {
    const options = user.accountLinks.map(
      ({ linkedAccountId, accountName }) => ({
        label: accountName,
        value: linkedAccountId,
      })
    );

    options.unshift({ label: user.accountName, value: user.id });
    options.unshift({ label: "All Accounts", value: "all" });

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: 3, fontWeight: 500 }}>
          Selected Account
        </span>
        <Select
          styles={{
            menu: (provided) => ({
              ...provided,
              minWidth: 200,
              padding: 7,
            }),
          }}
          options={options}
          defaultValue={options.find(
            ({ value }) => value === user.selectedAccountId
          )}
          onChange={onChange}
        />
      </div>
    );
  }

  return null;
}

AccountSelect.propTypes = {
  onChange: PropTypes.func,
};

AccountSelect.defaultProps = {
  onChange: () => {},
};
