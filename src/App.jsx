import { useState } from 'react';
import ComingSoonSplash from './components/ComingSoonSplash';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Controller state: "splash" | "admin-dashboard"
  const [currentView, setCurrentView] = useState("splash");

  // Authentication & Password state
  const [adminPassword, setAdminPassword] = useState("1234");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === adminPassword) {
      setShowLoginModal(false);
      setPasswordInput("");
      setAuthError("");
      setCurrentView("admin-dashboard");
    } else {
      setAuthError("Incorrect Admin Password");
    }
  };

  const handleLock = () => {
    setCurrentView("splash");
  };

  // View Switcher
  if (currentView === "admin-dashboard") {
    return (
      <AdminDashboard
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        onLock={handleLock}
      />
    );
  }

  return (
    <ComingSoonSplash
      showLoginModal={showLoginModal}
      setShowLoginModal={setShowLoginModal}
      passwordInput={passwordInput}
      setPasswordInput={setPasswordInput}
      authError={authError}
      onLogin={handleLogin}
    />
  );
}