import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import api from "../lib/api";

type Me = { id: string; email: string; name: string };

export default function Home() {
  const { logout } = useAuth();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    (async () => {
      const r = await api.get<Me>("/users/me");
      setMe(r.data);
    })().catch(console.error);
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-semibold">Welcome to the application.</h1>
          <button
            onClick={logout}
            className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200"
          >
            Logout
          </button>
        </div>

        <div className="mt-3 text-gray-700">
          {me
            ? <>Signed in as <span className="font-medium">{me.name}</span> ({me.email})</>
            : <>Loading your profile…</>}
        </div>
      </div>
    </div>
  );
}
