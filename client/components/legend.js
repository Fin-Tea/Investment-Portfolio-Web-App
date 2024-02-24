export default function Legend({ className, items }) {
  return (
    <div className={`flex justify-center ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="flex mr-2 items-center">
          <div style={{backgroundColor: item.color, borderColor: item.color, height: item.size, width: item.size}} className={`h-4 w-4 mr-2 rounded-full border-x border-y`} />{" "}
          <span className="font-bold">{item.name}</span>
        </div>
      ))}
    </div>
  );
}
