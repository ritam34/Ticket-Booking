import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold text-rail-night mb-1">Create an account</h1>
      <p className="text-rail-muted text-sm mb-8">Book tickets and track your journeys.</p>

      {error && (
        <div className="mb-4 text-sm text-rail-alert bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-rail-charcoal mb-1" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-rail-line rounded-sm px-3 py-2 bg-white"
          />
        </div>
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
          <label className="block text-sm text-rail-charcoal mb-1" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-rail-line rounded-sm px-3 py-2 bg-white"
          />
          <p className="text-xs text-rail-muted mt-1">At least 6 characters.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rail-night text-white rounded-sm py-2.5 font-medium hover:bg-rail-nightlight disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-rail-muted mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-rail-night underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
