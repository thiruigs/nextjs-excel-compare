import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../lib/firebase';

export default function TopBar({ title = "Dashboard", showBack = false }) {
  const router = useRouter();
  const auth = getAuth(app);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        {showBack && (
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white underline hover:text-gray-200"
          >
            ← Back
          </button>
        )}
        <h1 className="text-white text-xl font-semibold">{title}</h1>
      </div>
      <button
        onClick={handleLogout}
        className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
      >
        Logout
      </button>
    </div>
  );
}
