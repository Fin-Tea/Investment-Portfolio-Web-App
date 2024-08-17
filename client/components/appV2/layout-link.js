import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function LayoutLink({ href, children }) {
    const [hover, setHover] = useState(false);
    const router = useRouter();

  return (
    <Link href={href}  >
      <div className="flex flex-col" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}  >
        <span className="text-sm text-white cursor-pointer">
          {children}
        </span>
        {(router.route === href || hover) && (
          <hr className="!h-1 bg-purple-600 opacity-100 my-0" />
        )}
      </div>
    </Link>
  );
}
