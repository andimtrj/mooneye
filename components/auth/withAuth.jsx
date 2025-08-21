"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getConfig from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const { auth, db } = getConfig();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUser({ ...user, ...userDoc.data() });
          } else {
            setUser(user);
          }
        } else {
          router.push("/signin");
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [auth, db, router]);

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
