import React, { useState } from 'react';

export default function Pill({id, size="md", className, isActive = false, onClick, controlled, children, disabled}) {
    const [active, setActive] = useState(isActive);

    const trueActive = controlled ? isActive : active;

    function toggleActive() {
        setActive(!active);
    }

    let sizeClasses = "h-6 px-2 text-xs";

    if (size === "lg") {
        sizeClasses = "h-8 px-4 text-sm";
    } else if (size === "xl") {
        sizeClasses = "h-10 px-5 text-base";
    }

    const activeStyle = trueActive ?  "bg-purple-800 text-white" : "text-purple-800";

    return (<button className={`${sizeClasses} rounded-full border-x border-y border-purple-800 ${activeStyle} ${className}`} disabled={disabled} onClick={() => { toggleActive(); onClick && onClick({ id, isActive: !trueActive }) }} >{children}</button>);

}