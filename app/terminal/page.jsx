"use client";
import React from "react";
import withAuth from "@/components/auth/withAuth";

function TerminalPage({ user }) {
  return <div>Hello {user.name || user.email}!</div>;
}

export default withAuth(TerminalPage);
