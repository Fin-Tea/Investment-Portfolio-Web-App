import Tooltip from "./tooltip";

export default function MiniTable({className, title, tooltip, columns, data }) {
  return (
    <div className={className}>
      
      <div className="flex">
      <span className="text-base">{title}</span>
      {tooltip && <Tooltip text={tooltip} />}
      </div>
      {data?.length ? (<table className="mt-2 w-full">
        <thead className="border-b border-black">
            <tr>
          {columns.map((c, i) => (
            <th
              className={`text-sm px-1 ${
                i !== columns.length - 1 ? "border-r" : ""
              }`}
            >
              {c.Header}
            </th>
          ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr className={i !== data.length - 1 ? "border-b border-black" : ""}>
              {columns.map((c, j) => (
                <td className={`text-xs px-1 ${
                    j !== columns.length - 1 ? "border-r border-black" : ""
                  }`}>{r[c.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>) : (<div className="h-full w-full ml-2 mt-4"><p>No Info</p></div>)}
    </div>
  );
}
