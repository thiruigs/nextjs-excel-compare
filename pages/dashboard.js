// pages/dashboard.js
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import LogoutButton from "../components/LogoutButton";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Dashboard</h2>
      {user && <p>Welcome, {user.email}</p>}
      <LogoutButton />
    </div>
  );
}
