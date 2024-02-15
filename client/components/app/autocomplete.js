import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import Tooltip from "./tooltip";

export default function Autocomplete({
  className,
  placeholder,
  onSelect,
  items,
  tooltip,
  value,
  disabled,
}) {
  const [options, setOptions] = useState(items);


  return (
    <div className={`flex w-full items-center ${className}`}>
      <div className="w-full">
        <CreatableSelect
          className="w-full"
          placeholder={placeholder || ""}
          options={options}
          value={value}
          onChange={onSelect}
          isClearable
          isSearchable
          onCreateOption={(label) => {const item = {label}; setOptions([item, ...options]); onSelect && onSelect(item); }}
          isDisabled={disabled}
        />
      </div>
      {tooltip && <Tooltip text={tooltip} />}
    </div>
  );
}
