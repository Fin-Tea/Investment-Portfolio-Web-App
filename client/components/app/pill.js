import React, { useState } from 'react';

export default function Pill({id, className, isActive = false, onClick, controlled, children}) {
    const [active, setActive] = useState(isActive);

    const trueActive = controlled ? isActive : active;

    function toggleActive() {
        setActive(!active);
    }

    const activeStyle = trueActive ?  "bg-purple-800 text-white" : "text-purple-800";

    return (<button className={`h-6 rounded-full px-2 text-xs border-x border-y border-purple-800 ${activeStyle} ${className}`} onClick={() => { toggleActive(); onClick && onClick({ id, isActive: trueActive }) }}>{children}</button>);

}