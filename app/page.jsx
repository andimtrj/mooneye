'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-6 sm:p-20">
      <h1 className="text-4xl font-bold text-center tracking-tighter">
        Welcome to Mooneye
      </h1>
      <div className="flex flex-col gap-2 w-full">
        <Button onClick={() => router.push("/signup")}>Sign Up Here</Button>
      </div>
    </div>
  );
}
