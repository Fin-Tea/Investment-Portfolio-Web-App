import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

export default function DeleteConfirmationModal({
  header,
  isOpen,
  onClose,
  onSubmit,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <p className="font-bold">Are you sure?</p>
        </ModalBody>

        <ModalFooter>
          <button className="rounded-md border p-2 px-4 mr-4" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded-md bg-red-500 text-white p-2 px-4"
            onClick={() => {
              onSubmit && onSubmit();
              onClose();
            }}
          >
            Delete
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
