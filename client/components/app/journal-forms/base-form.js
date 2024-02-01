import React, {useState} from "react";
import DeleteConfirmationModal from "../delete-confirmation-modal";

export default function BaseForm({ edit, header, onSave, onDelete, children }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <div>
    <div className="w-2/3 border h-full flex flex-col mx-auto rounded-md">
      <div className="text-center">
        <h4 className="text-lg mt-2">{`${edit ? "Edit" : "New"} ${header}`}</h4>
      </div>
      <div className="flex justify-center px-4">
        <button className="mr-12 rounded-md bg-purple-800 text-white px-4" onClick={() => setShowDeleteModal(true)}>Delete</button>
        <button className="ml-12 rounded-md bg-purple-800 text-white px-4" onClick={() => onSave && onSave()}>Save</button>
      </div>
      <div className="mt-4 pb-4 px-4 overflow-auto max-h-[50vh]">{children}</div>
    </div>
    <DeleteConfirmationModal header="Delete Journal Entry" isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onSubmit={() => onDelete && onDelete()} />
    </div>
  );
}
