// Tag.jsx
import React from "react";

export function Tag({ children }) {
  return (
    <span className="px-3 py-1 text-sm font-semibold text-white bg-violet-400 rounded-xl mr-2">
      {children}
    </span>
  );
}
