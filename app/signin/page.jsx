"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import getConfig from "../../firebase/config";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ModalError } from "@/components/modalError";
import { ModalSuccess } from "@/components/modalSuccess";
function getCustomErrorMessage(message) {
  if (message.includes("auth/user-not-found") || message.includes("auth/wrong-password")) {
    return "Email or password is incorrect.";
  }
  if (message.includes("auth/invalid-email")) {
    return "Email format is invalid.";
  }
  if (message.includes("auth/too-many-requests")) {
    return "Too many failed attempts. Please try again later.";
  }
  if (message.includes("auth/invalid-credential")) {
    return "Email or password is incorrect.";
  }
  return message;
}

export default function SignInPage() {
  const { auth } = getConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // Handle sign in with email and password
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    if (!email || !password) {
      setErrors({ login: "Email and password are required." });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Sign in successful!");
    } catch (error) {
  setErrors({ login: getCustomErrorMessage(error.message) || "Login failed. Please try again." });
    }
    setLoading(false);
  };

  // Handle sign in with Google
  const handleGoogleSignIn = async () => {
    setErrors({});
    setSuccess("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSuccess("Sign in successful!");
    } catch (error) {
  setErrors({ login: getCustomErrorMessage(error.message) || "Login failed. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-fit gap-3">
      <Card className="w-[80vw] lg:w-[20vw] max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : "Sign In"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? "Loading..." : "Sign In with Google"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {errors.login && <ModalError title={errors.login} />}
      {success && <ModalSuccess title={success} />}
    </div>
  );
}
