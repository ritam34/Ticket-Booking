import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-rail-night mb-1">Log in</h1>
      <p className="text-rail-muted text-sm mb-8">Access your bookings and PNR history.</p>

      {error && (
        <div className="mb-4 text-sm text-rail-alert bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-rail-charcoal mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-rail-line rounded-sm px-3 py-2 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm text-rail-charcoal mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-rail-line rounded-sm px-3 py-2 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rail-night text-white rounded-sm py-2.5 font-medium hover:bg-rail-nightlight disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-rail-muted mt-6">
        New here?{' '}
        <Link to="/signup" className="text-rail-night underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
