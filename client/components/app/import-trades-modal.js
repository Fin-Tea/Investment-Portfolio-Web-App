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
import { useForm, Controller } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const UPLOAD_KEY = "csv";
const PLATFORM_KEY = "platformId";
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

function MainForm({ platforms, connectedPlatforms, onClick }) {
  return (
    <div>
      <div className="flex flex-col mb-4">
        <button
          className="rounded-full border-x border-y border-purple-800 text-sm text-purple-800 hover:bg-purple-800 hover:text-white px-2 py-2"
          onClick={() => onClick && onClick({ action: ACTIONS.NAV_TO_UPLOAD })}
        >
          Upload CSV
        </button>
        <button
          className="rounded-full border-x border-y border-purple-800 text-sm text-purple-800 hover:bg-purple-800 hover:text-white px-2 py-2 mt-4"
          onClick={() =>
            onClick && onClick({ action: ACTIONS.NAV_TO_CONNECT_PLATFORM })
          }
        >
          Connect Platform
        </button>
      </div>
      <h4 className="text-lg">Connected Platforms</h4>
      <hr className="w-full border-t border-gray-300 mx-auto mt-0" />
      <div>
        {connectedPlatforms ? (
          connectedPlatforms.map(({ platformId, accountId, platformName }) => (
            <div>{platformName}</div>
          ))
        ) : (
          <span>No platforms connected yet</span>
        )}
      </div>
    </div>
  );
}

function UploadForm({
  platforms,
  connectedPlatforms,
  register,
  control,
  onSubmit,
}) {
  return (
    <div>
      <form>
        <div>
          {/* <Select
            placeholder="Choose Trading/Investing Platform..."
            options={platformOptions}
            {...register(PLATFORM_KEY)}
          /> */}

          <Controller
            name={PLATFORM_KEY}
            control={control}
            render={ ({ field: { onChange, value, ref }}) => (
              <Select
                name={PLATFORM_KEY}
                placeholder="Choose Trading/Investing Platform..."
                options={platformOptions}
                value={platformOptions.find((p) => p.value === value)}
                onChange={(val) => onChange(val.value)}
              />
            )}
          />
        </div>
        <input className="w-full mt-4" type="file" {...register(UPLOAD_KEY)} />
      </form>
    </div>
  );
}

function ConnectPlatformForm({
  platforms,
  connectedPlatforms,
  register,
  control,
  onSubmit,
}) {
  return (
    <div>
      <form>
        <div>
          <Select
            placeholder="Choose Trading/Investing Platform..."
            options={connectPlatformOptions}
            {...register(CONNECT_PLATFORM_KEY)}
          />
        </div>
      </form>
    </div>
  );
}

export default function ImportTradesModal({
  isOpen,
  onClose,
  platforms,
  connectedPlatforms,
  onUpload,
  onRefresh,
}) {
  const { register, control, handleSubmit } = useForm();
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
    console.log(data);
    const formData = new FormData();
    console.log(data[UPLOAD_KEY][0]);
    formData.append(UPLOAD_KEY, data[UPLOAD_KEY][0]);
    console.log("form data", formData.get(UPLOAD_KEY));
    onUpload && onUpload(formData);
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
        <ModalBody>
          <CurrentForm
            register={register}
            control={control}
            onClick={handleClick}
          />
        </ModalBody>

        <ModalFooter>
          {formId === 1 && (
            <button
              className="rounded-md border p-2 px-4 mr-4 bg-purple-800 text-sm text-white"
              onClick={handleSubmit(processSubmit)}
            >
              Upload
            </button>
          )}
          {formId === 2 && (
            <button
              className="rounded-md border p-2 px-4 mr-4 bg-purple-800 text-sm text-white"
              onClick={handleSubmit(processSubmit)}
            >
              Connect
            </button>
          )}
          <button
            className="rounded-md border p-2 px-4 mr-4"
            onClick={handleClose}
          >
            Close
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
