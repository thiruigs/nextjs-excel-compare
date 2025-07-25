// components/LogoutButton.js
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
      Logout
    </button>
  );
}
