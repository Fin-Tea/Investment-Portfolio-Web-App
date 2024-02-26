import React, { useState } from "react";
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
import DragDropUpload from "./drag-drop-upload";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const FILE_UPLOAD_KEY = "csv";
const PLATFORM_ACCOUNT_KEY = "platformAccountId";
const TIMEZONE_KEY = "timezone";
const TIMEZONE_OFFSET_KEY = "timezoneOffset";
const CONNECT_PLATFORM_KEY = "connectPlatformId";

const platformOptions = [
  { label: "TD Ameritrade", value: 0 },
  { label: "Ninja Trader", value: 1 },
];

const connectPlatformOptions = [
  { label: "TD Ameritrade", value: "https://auth.tdameritrade.link" },
];

const ACTIONS = {
  NAV_TO_UPLOAD: "NAV_TO_UPLOAD",
  NAV_TO_CONNECT_PLATFORM: "NAV_TO_CONNECT_PLATFORM",
  NAV_BACK: "NAV_BACK",
};

function BaseForm({ children, formId, onSubmit, onClose }) {
  return (
    <div>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        {formId === 1 && (
          <button
            className="rounded-md border p-2 px-4 mr-4 bg-purple-800 text-sm text-white"
            onClick={onSubmit}
          >
            Upload
          </button>
        )}

        {formId === 2 && (
          <button
            className="rounded-md border p-2 px-4 mr-4 bg-purple-800 text-sm text-white"
            onClick={onSubmit}
          >
            Connect
          </button>
        )}
        <button className="rounded-md border p-2 px-4 mr-4" onClick={onClose}>
          Close
        </button>
      </ModalFooter>
    </div>
  );
}

function MainForm({ platforms, connectedPlatforms, onClose, formId, onClick }) {
  return (
    <BaseForm formId={formId} onClose={onClose}>
      <div>
        <div className="flex flex-col mb-4">
          <button
            className="rounded-full border-x border-y border-purple-800 text-sm text-purple-800 hover:bg-purple-800 hover:text-white px-2 py-2"
            onClick={() =>
              onClick && onClick({ action: ACTIONS.NAV_TO_UPLOAD })
            }
          >
            Upload CSV
          </button>
          {/* TODO: Connecting accounts not in scope for MVP */}
          {/* <button
          className="rounded-full border-x border-y border-purple-800 text-sm text-purple-800 hover:bg-purple-800 hover:text-white px-2 py-2 mt-4"
          onClick={() =>
            onClick && onClick({ action: ACTIONS.NAV_TO_CONNECT_PLATFORM })
          }
        >
          Connect Platform
        </button> */}
        </div>
        {/* <h4 className="text-lg">Connected Platforms</h4>
      <hr className="w-full border-t border-gray-300 mx-auto mt-0" />
      <div>
        {connectedPlatforms ? (
          connectedPlatforms.map(({ platformId, accountId, platformName }) => (
            <div>{platformName}</div>
          ))
        ) : (
          <span>No platforms connected yet</span>
        )}
      </div> */}
      </div>
    </BaseForm>
  );
}

function UploadForm({ items, formId, onSubmit, onClose }) {
  const validationSchema = Yup.object().shape({
    [PLATFORM_ACCOUNT_KEY]: Yup.object()
      .nullable()
      .required("Trading/Investing account is required"),
    [FILE_UPLOAD_KEY]: Yup.mixed().nullable().required("Csv is required"),
  });

  const formOptions = {
    defaultValues: {
      [PLATFORM_ACCOUNT_KEY]: null,
      [FILE_UPLOAD_KEY]: null,
    },
    resolver: yupResolver(validationSchema),
  };

  const { setValue, value, handleSubmit, formState, getValues } =
    useForm(formOptions);

  //   console.log("handleSubmit", await handleSubmit(onSubmit)());

  const { errors } = formState;
  console.log("errors", errors);
  console.log("values", getValues());
  return (
    <BaseForm
      formId={formId}
      onSubmit={handleSubmit(onSubmit)}
      onClose={onClose}
    >
      <div>
        <form>
          <div>
            <Select
              placeholder="Choose Trading/Investing Account..."
              options={items}
              value={value}
              onChange={(val) => setValue(PLATFORM_ACCOUNT_KEY, val)}
            />
            <div className="text-red-600 text-xs">
              {errors && errors[PLATFORM_ACCOUNT_KEY]
                ? errors[PLATFORM_ACCOUNT_KEY].message
                : ""}
            </div>
          </div>
          <DragDropUpload
            onFileDrop={(file) => setValue(FILE_UPLOAD_KEY, file)}
          />
          <div className="text-red-600 text-xs">
            {errors && errors[FILE_UPLOAD_KEY]?.message}
          </div>
        </form>
      </div>
    </BaseForm>
  );
}

function ConnectPlatformForm({ formId, onSubmit, onClose }) {
  return (
    <BaseForm formId={formId} onSubmit={onSubmit} onClose={onClose}>
      <div>
        <form>
          <div>
            <Select
              placeholder="Choose Trading/Investing Platform..."
              options={connectPlatformOptions}
            />
          </div>
        </form>
      </div>
    </BaseForm>
  );
}

export default function ImportTradesModal({
  isOpen,
  onClose,
  platformAccountItems,
  onSubmit,
}) {
  const { setValue, value, handleSubmit, errors } = useForm();
  const [formId, setFormId] = useState(0);

  const formMap = {
    0: MainForm,
    1: UploadForm,
    2: ConnectPlatformForm,
  };

  const CurrentForm = formMap[formId];

  function handleClick({ action }) {
    if (action === ACTIONS.NAV_TO_UPLOAD) {
      setFormId(1);
    } else if (action === ACTIONS.NAV_TO_CONNECT_PLATFORM) {
      setFormId(2);
    }
  }

  function handleClose() {
    setFormId(0);
    onClose && onClose();
  }

  function processSubmit(data) {
    if (formId === 1) {
      const formData = new FormData();
      const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
      formData.append(FILE_UPLOAD_KEY, data[FILE_UPLOAD_KEY]);
      formData.append(PLATFORM_ACCOUNT_KEY, data[PLATFORM_ACCOUNT_KEY].value);
      formData.append(TIMEZONE_KEY, timeZone);
      formData.append(TIMEZONE_OFFSET_KEY, new Date().getTimezoneOffset());
      // console.log(
      //   "formData",
      //   formData.get(PLATFORM_ACCOUNT_KEY),
      //   formData.get(FILE_UPLOAD_KEY)
      // );
      onSubmit && onSubmit({ action: "upload", formData });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center">
            {formId !== 0 && (
              <FontAwesomeIcon
                className="cursor-pointer mr-2"
                onClick={() => setFormId(0)}
                icon={faArrowLeft}
                height={16}
              />
            )}{" "}
            <h4 className="text-base mb-0">Import Trades</h4>
          </div>
        </ModalHeader>
        <ModalCloseButton />

        <CurrentForm
          formId={formId}
          items={platformAccountItems}
          onClick={handleClick}
          onClose={handleClose}
          onSubmit={processSubmit}
        />
      </ModalContent>
    </Modal>
  );
}
