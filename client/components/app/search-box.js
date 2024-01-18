import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'






export default function SearchBox({ className, placeholder, onClick }) {
    const [text, setText] = useState("");
    
    return (<div className={`flex ${className}`}>
        <input placeholder={placeholder || "Search"} className="border-gray-300 border-x border-y px-2" onChange={(e) => setText(e.target.value)} />
        <FontAwesomeIcon className="ml-2 cursor-pointer" icon={faMagnifyingGlass} height={32} onClick={() => onClick && onClick(text)} />
    </div>);


}