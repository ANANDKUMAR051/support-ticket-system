import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.user.role === 'AGENT' ? '/agent' : '/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage support tickets.</p>
        {error && <div className="alert error">{error}</div>}
        <label>Email<input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></label>
        <label>Password<input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></label>
        <button className="button" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <p className="center">No account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
