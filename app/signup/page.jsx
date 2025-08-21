"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import getConfig from "../../firebase/config";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { AlertCircleIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = async () => {
    const newErrors = {};
    if (!form.name) {
      newErrors.name = "Name is required";
    }

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    } else {
      const { db } = getConfig();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", form.email));
      const emailSnapshot = await getDocs(q);
      if (!emailSnapshot.empty) {
        newErrors.email = "Email is already taken";
      }
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setIsLoading(false);
    return newErrors;
  };

  const handleSignUp = async () => {
    setSubmitted(true); // Mark form as submitted
    setIsLoading(true);
    setError({});
    setSuccess("");
    const validationErrors = await validate();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      setIsLoading(false);
      return;
    }

    const { db, auth } = getConfig();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: form.email,
        name: form.name,
      });
      setSuccess("Registration successful!");
      // Optionally, you can redirect after a delay
      setTimeout(() => {
        router.push("/signin");
      }, 1500);
    } catch (err) {
      setError({ register: err.message || "Registration failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Signup
  const handleGoogleSignup = async (e) => {
    if (e) e.preventDefault();
    setIsGoogleLoading(true);
    setError({});
    const { db, auth } = getConfig();
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
      });
      router.push("/signin");
    } catch (err) {
      setError({ register: err.message || "Google sign up failed" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-fit gap-3">
      <Card className="w-[90vw] lg:w-[20vw] max-w-sm">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
              />

              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />

              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />

              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Signing Up...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Signing Up with Google...
                  </div>
                ) : (
                  "Sign Up with Google"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {submitted && Object.values(error).some((e) => e) && (
        <Alert variant="destructive" className="w-full">
          <AlertCircleIcon />
          <AlertTitle>Unable to process your registration.</AlertTitle>
          <AlertDescription>
            <p className="text-sm">
              {error.email
                ? error.email
                : error.name
                ? error.name
                : error.password
                ? error.password
                : error.confirmPassword
                ? error.confirmPassword
                : error.register
                ? error.register
                : "Please verify information and try again."}
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
