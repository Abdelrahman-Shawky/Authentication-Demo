import { type JSX } from 'react'
import './App.css'
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import { useAuth } from "./store/auth";

function Protected({ children }: { children: JSX.Element}) {
  const { accessToken, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }  
  if (!accessToken) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/"
        element={
          <Protected>
            <Home />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}