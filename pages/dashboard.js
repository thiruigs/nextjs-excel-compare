import { useRouter } from "next/router";
import { useEffect } from "react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import TopBar from '../components/TopBar.js';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth).catch(() => {}); // Ignore if not signed in
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <div>
    <TopBar title="Dashboard" />
    <div className="p-6">
      {/*<h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>*/}

      <div className="mt-6">
        <a href="/fileupload1" className="text-blue-600 underline">
          EDGAR and XBRL Team Excel Compare
        </a> [Two files upload]
      </div>

      <div className="mt-6">
        <a href="/fileupload2" className="text-blue-600 underline">
          Other Team Excel Compare
        </a> [Two files upload]
      </div>

      <div className="mt-6">-------------------------------------------</div>

      <div className="mt-6">
        <a href="/fileuploadsinglefile1" className="text-blue-600 underline">
          EDGAR and XBRL Team Excel Compare 
        </a> [Single file upload]
      </div>

      <div className="mt-6">
        <a href="/fileuploadsinglefile2" className="text-blue-600 underline">
          Other Team Excel Compare 
        </a> [Single file upload]
      </div>

      <div className="mt-6">-------------------------------------------</div>

      <div className="mt-6">
        <a href="/fileuploadoff" className="text-blue-600 underline">
          OFF Extraction 
        </a> [Single file upload]
      </div>

    </div>
    </div>
  );
}
