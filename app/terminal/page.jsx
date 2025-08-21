"use client";
import React from "react";
import withAuth from "@/components/auth/withAuth";

function TerminalPage({ user }) {
  return (
    <div className="font-source-code-pro p-4">
      <div>Hello {user.name || user.email}!</div>
    </div>
  );
}

export default withAuth(TerminalPage);
