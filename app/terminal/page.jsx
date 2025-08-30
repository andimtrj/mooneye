"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import getConfig from "../../firebase/config";
import TerminalHistory from "./components/TerminalHistory";
import TerminalInput from "./components/TerminalInput";
import TerminalService from "./components/TerminalService";

function TerminalPage({ user }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const terminalRef = useRef(null);
  const { db, auth } = getConfig();

  // Initialize terminal service
  const terminalService = useRef(null);

  useEffect(() => {
    // Initialize terminal service with dependencies
    terminalService.current = new TerminalService(
      db,
      auth,
      user,
      router,
      setHistory
    );

    // Display welcome message
    const greeting = `
    Welcome to Mooneye Terminal (still in development), ${user.name || user.email}!
    Type 'help' to see available commands.`;
    setHistory([{ type: "system", text: greeting }]);
  }, [db, auth, user, router]);

  // Efek cursor berkedip
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [history]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();

    // Add command to history
    setHistory((prev) => [...prev, { type: "command", text: command }]);
    setInput("");

    // Save and process command
    if (terminalService.current) {
      await terminalService.current.saveCommand(command);
      terminalService.current.processCommand(command);
    }
  };

  return (
    <div className="font-source-code-pro text-black p-4 h-screen flex flex-col">
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto whitespace-pre-wrap"
      >
        <TerminalHistory history={history} />
        <TerminalInput
          input={input}
          cursorVisible={cursorVisible}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default withAuth(TerminalPage);
