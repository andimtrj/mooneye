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
import { useRouter } from "next/navigation";
import { AlertCircleIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
    setErrors({});
  };

  // Handle sign in with email and password
  const handleSignIn = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setIsLoading(true);
    const { auth } = getConfig();

    if (!form.email || !form.password) {
      setErrors({ login: "Email and password are required." });
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/terminal");
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setErrors({ login: "Email or password are incorrect" });
      } else {
        setErrors({
          login: error.message || "Login failed. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign in with Google
  const handleGoogleSignIn = async () => {
    setErrors({});
    setIsLoading(true);
    const { auth } = getConfig();
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/terminal");
    } catch (error) {
      setErrors({
        login: error.message || "Login failed. Please try again.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col w-fit gap-3">
      <Card className="w-[90vw] lg:w-[20vw] max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
              />
              <Input
                placeholder="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                Sign In with Google
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {submitted && errors.login && (
        <Alert variant="destructive" className="max-w-[90vw] mt-4">
          <AlertCircleIcon />
          <AlertTitle>Unable to sign in.</AlertTitle>
          <AlertDescription>
            <p>{errors.login}</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
