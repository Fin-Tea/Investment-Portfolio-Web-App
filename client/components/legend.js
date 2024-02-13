export default function Legend({ className, items }) {
  return (
    <div className={`flex justify-center ${className}`}>
      {items.map((item) => (
        <div className="flex mr-2 items-center">
          <div style={{backgroundColor: item.color, borderColor: item.color}} className={`h-4 w-4 mr-2 rounded-full border-x border-y`} />{" "}
          <span className="font-bold">{item.name}</span>
        </div>
      ))}
    </div>
  );
}
