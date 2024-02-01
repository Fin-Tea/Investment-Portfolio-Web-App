import React, { useState } from "react";

export default function JournalEntry({ id, tag, date, entryText, symbol, onClick}) {
    const [hover, setHover] = useState(false);

    function toggleHover() {
        setHover(!hover);
    }

    const cursor = onClick ? "cursor-pointer" : "cursor-default";
    const background = hover ? "bg-green-400" : "bg-transparent";

    return (<div className={`flex flex-col w-full p-1 ${cursor} ${background}`} onClick={() => onClick && onClick(id)} onMouseEnter={toggleHover} onMouseLeave={toggleHover}>
        <div className="flex flex-row justify-between font-bold">
            <span>{tag}</span>
            {symbol && <span>{symbol}</span>}
        </div>
        <div>
            <span className="text-sm text-gray-500">{date}</span>
        </div>
        <p className="line-clamp-1 mb-2">
            {entryText}
        </p>
    </div>)

}