import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-rail-line bg-rail-platform">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-mono text-lg font-semibold tracking-tight text-rail-night">
            RailBook
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link to="/my-bookings" className="text-rail-charcoal hover:text-rail-night">
                My bookings
              </Link>
              <Link to="/pnr-status" className="text-rail-charcoal hover:text-rail-night">
                PNR status
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-rail-charcoal hover:text-rail-night">
                  Admin
                </Link>
              )}
              <span className="text-rail-muted">{user.name.split(' ')[0]}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-rail-charcoal hover:text-rail-alert"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/pnr-status" className="text-rail-charcoal hover:text-rail-night">
                PNR status
              </Link>
              <Link
                to="/login"
                className="px-4 py-1.5 bg-rail-night text-white rounded-sm hover:bg-rail-nightlight"
              >
                Log in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
