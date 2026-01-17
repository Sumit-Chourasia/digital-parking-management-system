import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header(){
  const user = JSON.parse(localStorage.getItem('dp_user') || 'null');
  const navigate = useNavigate();

  function logout(){
    localStorage.removeItem('dp_user');
    navigate('/login');
    window.location.reload();
  }

  return (
    <header className="bg-white border-b">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div className="header-logo">DP</div>
          <div>
            <div className="text-xl font-bold">Smart Parking</div>
            <div className="text-sm text-slate-500">Book slots • Report violations • Admin review</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-700 hover:text-slate-900">Dashboard</Link>
          <Link to="/bookings" className="text-slate-700 hover:text-slate-900">My Bookings</Link>
          {!user ? (
            <Link to="/login" className="btn-ghost">Sign In</Link>
          ) : (
            <>
              <div className="role-badge">{user.username}</div>
              <button onClick={logout} className="btn-ghost">Sign Out</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
