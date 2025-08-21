"use client";
import React from 'react';

const TerminalHistory = ({ history }) => {
  return (
    <div className="whitespace-pre-wrap">
      {history.map((item, index) => (
        <div
          key={index}
          className={
            item.type === "command"
              ? "text-black pl-4"
              : item.type === "system"
              ? "text-black"
              : "text-black"
          }
        >
          {item.type === "command" ? `$ ${item.text}` : item.text}
        </div>
      ))}
    </div>
  );
};

export default TerminalHistory;
