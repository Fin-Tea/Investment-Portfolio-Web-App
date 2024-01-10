import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons'

export default function SideView({className, header, children }) {
    const [isExpanded, setExpanded] = useState(true);

    function toggleExpanded() {
        setExpanded(!isExpanded);
    }

    const width = isExpanded ? "w-60" : "w-12";

  return (
    <div className={`border-gray-300 border-t border-r border-b p-2 h-full ${width} ${className}`} >
        <div className="flex">
        {isExpanded && (<h3 className="h-7 text-lg w-full">{header}</h3>)}
        <FontAwesomeIcon className="cursor-pointer" onClick={toggleExpanded} icon={isExpanded ? faAnglesLeft : faAnglesRight} height={32} />
        </div>
        {isExpanded && (<div className="h-full flex flex-col">{children}</div>)}
        {!isExpanded && (<div className="h-full flex flex-col ml-2 mt-2">{header.split('').map((char) => <p className={ char === ' ' ? 'mb-2' : 'mb-0'}>{char}</p>)}</div>)}
        
    </div>
  );
}
