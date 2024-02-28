import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

export default function JournalEntry({ id, tag, isLinked, date, entryText, symbol, isActive, onClick}) {
    const [hover, setHover] = useState(false);

    function toggleHover() {
        setHover(!hover);
    }

    const cursor = onClick ? "cursor-pointer" : "cursor-default";
    const background = (hover || isActive) ? "bg-green-400" : "bg-transparent";
    // TODO: refactor to tailwind hover: to handle background styling
    return (<div className={`flex flex-col w-full p-1 ${cursor} ${background}`} onClick={() => onClick && onClick(id)} onMouseEnter={toggleHover} onMouseLeave={toggleHover}>
        <div className="flex flex-row justify-between font-bold">
            <div className="flex"><span>{`#${tag}`}</span>
            {isLinked && (<FontAwesomeIcon className="ml-2 h-5 text-gray-200" icon={faLink} height={32} />)}
            </div>
            {symbol && <span>{symbol}</span>}
        </div>
        <div>
            <span className="text-sm text-gray-500">{date}</span>
        </div>
        <p className="line-clamp-2 mb-2">
            {entryText}
        </p>
    </div>)

}