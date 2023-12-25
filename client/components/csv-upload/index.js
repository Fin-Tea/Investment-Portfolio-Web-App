import React from "react";
import { useForm } from "react-hook-form";
import Popup from "reactjs-popup";

import PropTypes from "prop-types";

const UPLOAD_KEY = "csv";

export default function CSVUpload({ title, error, onSubmit }) {
  const { register, handleSubmit } = useForm();

  const processSubmit = (data) => {
    console.log(data);
    const formData = new FormData();
    console.log(data[UPLOAD_KEY][0]);
    formData.append(UPLOAD_KEY, data[UPLOAD_KEY][0]);
    console.log("form data", formData.get(UPLOAD_KEY));
    onSubmit(formData);
  };

  return (
    <Popup
      contentStyle={{ width: 300, padding: 7 }}
      trigger={<button className="btn btn-primary">Upload CSV</button>}
    >
      <div>
        {title && <h5 style={{ marginBottom: 12 }}>{title}</h5>}
        <form>
          <input
            style={{ width: "100%" }}
            type="file"
            {...register(UPLOAD_KEY)}
          />
          <button
            style={{ marginTop: 12, width: "100%" }}
            className="btn btn-primary"
            onClick={handleSubmit(processSubmit)}
          >
            Submit
          </button>
        </form>
      </div>
    </Popup>
  );
}

CSVUpload.propTypes = {
  title: PropTypes.string,
  error: PropTypes.string,
  onSubmit: PropTypes.func,
};

CSVUpload.defaultProps = {
  title: "",
  error: "",
  onSubmit: () => {},
};
