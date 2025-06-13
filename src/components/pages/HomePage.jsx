import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Since App.jsx already redirects "/" to "/dashboard", this page is technically unreachable
    // unless that redirect is removed. If it were reachable, it would serve as a landing.
    // For now, it explicitly navigates to dashboard to ensure functionality if routing changes.
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
      <p className="text-gray-500">Redirecting to Dashboard...</p>
    </div>
  );
}

export default HomePage;