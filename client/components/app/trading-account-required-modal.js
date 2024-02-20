import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import Link from "next/link";

export default function TradingAccountRequiredModal({
  body,
  isOpen,
}) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Trading/Investing Account Required</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {body && <p>{body}</p>}
          <Link href="/app/accounts?create=true">
            <button className="rounded-full w-full bg-purple-800 text-white px-4 py-1">
              Create Trading/Investing Account
            </button>
          </Link>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
