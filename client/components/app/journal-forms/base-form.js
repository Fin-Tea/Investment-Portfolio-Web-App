export default function BaseForm({ id, header, onSave, onDelete, children }) {
  return (
    <div className="w-2/3 border h-full flex flex-col mx-auto rounded-md">
      <div className="text-center">
        <h4 className="text-lg mt-2">{`${id ? "Edit" : "New"} ${header}`}</h4>
      </div>
      <div className="flex justify-center px-4">
        <button className="mr-12 rounded-md bg-purple-800 text-white px-4" onClick={() => onDelete && onDelete(id)}>Delete</button>
        <button className="ml-12 rounded-md bg-purple-800 text-white px-4" onClick={() => onSave && onSave(id)}>Save</button>
      </div>
      <div className="mt-4 pb-4 px-4 overflow-scroll max-h-[50vh]">{children}</div>
    </div>
  );
}
