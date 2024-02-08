import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

export default function PlatformAccountModal({
  platformOptions,
  isOpen,
  onClose,
  onSubmit,
}) {
  const validationSchema = Yup.object().shape({
    platform: Yup.object().required("Trading/Investing Platform required"),
    accountName: Yup.string().required("Milestone is required"),
  });

  const formOptions = {
    resolver: yupResolver(validationSchema),
  };

  const { register, handleSubmit, formState, setValue, watch, reset } =
    useForm(formOptions);
  const { errors } = formState;

  const platform = watch("platform");

  function processSubmit(formData) {
    onSubmit && onSubmit(formData);
    !Object.values(errors).length && onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Trading/Investing Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div>
            <label className="text-sm ml">Platform</label>
            <Select
              placeholder="Choose Trading/Investing Platform..."
              options={platformOptions}
              value={platform}
              onChange={(val) => setValue("platform", val)}
            />
            <div className="text-red-600 text-xs">
              {errors.platform?.message}
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm ml">Account Name</label>
            <input
              {...register("accountName")}
              className="border w-full rounded-md p-2"
            />
            <div className="text-red-600 text-xs">
              {errors.accountName?.message}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <button className="rounded-md border p-2 px-4 mr-4" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded-md bg-purple-800 text-white p-2 px-4"
            onClick={handleSubmit(processSubmit)}
          >
            Create
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
