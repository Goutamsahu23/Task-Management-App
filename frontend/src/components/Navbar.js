// src/components/Navbar.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import SearchFilter from './SearchFilter';

export default function Navbar() {
  const user = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setQ('');
  };

  return (
    <div style={{ padding: '10px 18px' }}>
      <div className="container app-header" role="banner">
        <div className="brand" aria-label="Brand">
          <div className="logo">TM</div>
          <div>
            <h1>TaskManagement</h1>
            <div className="small">Boards · Tasks · Collaboration</div>
          </div>
        </div>

        {user ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <form className="search-box" onSubmit={onSearchSubmit} role="search" aria-label="Search cards">
              <input
                className="search-input"
                placeholder="Search cards, labels, boards..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              <button className="btn ghost" type="submit">Search</button>
            </form>

            {/* FILTER BUTTON */}
            <button
              className="btn ghost"
              onClick={() => setFilterOpen(true)}
              title="Open filters"
              aria-label="Open filters"
              style={{ marginLeft: 6 }}
            >
              ⚙️ Filters
            </button>
          </div>
        ) : (
          <div style={{ width: '360px' }} aria-hidden="true" />
        )}

        <div className="user-panel">
          {user ? (
            <>
              <div>
                <div className="user-info">
                  <div className="name">{user.name}</div>
                  <div className="small">{user.email}</div>
                </div>
              </div>
              <div className="avatar" title={user.name ? user.name : 'User'}>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <button className="btn ghost" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn ghost">Login</button></Link>
              <Link to="/register"><button className="btn primary">Register</button></Link>
            </>
          )}
        </div>
      </div>

      {/* Filter modal */}
      <SearchFilter open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  );
}
