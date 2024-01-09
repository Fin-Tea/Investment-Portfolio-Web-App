import React, {useState } from "react"
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import Tooltip from "./tooltip";

export default function Autocomplete({
    className,
  placeholder,
  onSearch,
  onSelect,
  items,
  tooltip,
  value
}) {
    const [isFocused, setIsFocused] = useState(false);

    const handleOnFocus = () => {
        console.log('Focused')
        setIsFocused(true);
      }

  const handleBlur = () => {
    setIsFocused(false);
  }

  return (<div className={`flex w-full items-center ${className}`}>
    <div className="w-full" onBlur={handleBlur}>
    <ReactSearchAutocomplete
    className="w-full autocomplete"
      showIcon={false}
      styling={{ boxShadow: "none", borderRadius: "7px", zIndex: isFocused ? 10: 0 }}
      placeholder={placeholder}
      onFocus={handleOnFocus}
      showNoResults={false}
      onSearch={onSearch}
      onSelect={onSelect}
      items={items}
      fuseOptions={{ keys: ["label"] }}
      resultStringKeyName="label"
      onBlur
      inputSearchString={value || ""}
    />
    </div>
    {tooltip && <Tooltip text={tooltip} />}
    </div>
  );
}
