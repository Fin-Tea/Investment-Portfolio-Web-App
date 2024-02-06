import React, { useState } from "react";
import Dropzone from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'



export default function DragDropUpload({onFileDrop}) {
    const [file, setFile] = useState(null);

    function handleFileSelect([file]) {
        setFile(file);
        onFileDrop && onFileDrop(file);
    }
    return (<Dropzone onDrop={handleFileSelect}>
    {({getRootProps, getInputProps}) => (
      <section className='border-gray-300 outline-dashed outline-gray-300 p-4 mt-4'>
        <div {...getRootProps()} className='flex flex-col justify-center'>
          <input {...getInputProps()} />
          <FontAwesomeIcon icon={faCloudArrowUp} color='rgb(107,33,168)' height={64} />
          <p className='text-center'>Drag and drop to upload csv here <br />or <br /> <span className='cursor-pointer underline'>click here to browse</span></p>
        </div>
        {file && (<div><span className="text-green-600">{file.name}</span></div>)}
      </section>
    )}
  </Dropzone>);
}