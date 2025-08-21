"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getConfig from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const { auth } = getConfig();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
        } else {
          router.push("/signin");
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [auth, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} user={user} />;
  };

  AuthComponent.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return AuthComponent;
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export default withAuth;
