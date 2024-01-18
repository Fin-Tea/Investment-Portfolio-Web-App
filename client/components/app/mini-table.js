export default function MiniTable({className, title, columns, data }) {
  return (
    <div className={className}>
      <span className="text-base">{title}</span>
      <table className="mt-2 w-full">
        <thead className="border-b">
          {columns.map((c, i) => (
            <th
              className={`text-sm ${
                i !== columns.length - 1 ? "border-r" : ""
              }`}
            >
              {c.Header}
            </th>
          ))}
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr className={i !== data.length - 1 ? "border-b" : ""}>
              {columns.map((c, j) => (
                <td className={`text-xs px-1 ${
                    j !== columns.length - 1 ? "border-r" : ""
                  }`}>{r[c.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
