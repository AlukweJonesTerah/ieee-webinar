"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthGuard({ 
  children,
  adminOnly = true 
}: { 
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((loggedInUser) => {
      setUser(loggedInUser); // ✅ `user` is now used in JSX below
      setLoading(false);

      if (!loggedInUser) {
        router.push("/login");
      } else if (adminOnly && loggedInUser.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-ieee-blue"></div>
      </div>
    );
  }

  return (
    <>
      {adminOnly && user && (
        <p className="text-center text-gray-600">Logged in as: {user.email}</p>
      )}
      {children}
    </>
  );
}
