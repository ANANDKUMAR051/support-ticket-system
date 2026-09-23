import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must contain at least 8 characters');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card card" onSubmit={submit}>
        <h1>Create account</h1>
        {error && <div className="alert error">{error}</div>}
        <label>Name<input required minLength="2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></label>
        <label>Email<input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></label>
        <label>Password<input type="password" required minLength="8" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></label>
        <button className="button" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <p className="center">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
