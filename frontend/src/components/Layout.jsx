import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link className="brand" to={user?.role === 'AGENT' ? '/agent' : '/customer'}>
          SupportDesk
        </Link>
        <nav>
          {user && (
            <>
              <span className="user-chip">{user.name} · {user.role}</span>
              <button className="button button-small" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </header>
      <main className="container"><Outlet /></main>
    </div>
  );
}
