"use client";
import React, { useRef, useEffect } from "react";

const TerminalInput = ({
  input,
  cursorVisible,
  handleInputChange,
  handleSubmit,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus ke input
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center mt-1">
      <span
        className={`${
          cursorVisible ? "opacity-100" : "opacity-0"
        } transition-opacity mr-2 inline-block bg-black w-2 h-5`}
      ></span>
      <form onSubmit={handleSubmit} className="flex-1">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          className="bg-transparent border-none outline-none w-full text-black"
          autoFocus
        />
      </form>
    </div>
  );
};

export default TerminalInput;
