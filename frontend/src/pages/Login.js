import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const dispatch = useDispatch();
  const auth = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (auth.token) navigate('/');
  }, [auth.token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (res.meta.requestStatus === 'fulfilled') {
      // token saved in slice via extraReducers
      navigate('/');
    }
  };

  return (
    <div className="login-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:12 }}>
        <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <button className="btn btn-primary" type="submit" disabled={auth.loading}>Login</button>
          <Link to="/register">Create account</Link>
        </div>
        {auth.error && <div style={{ color:'red' }}>{auth.error.message || JSON.stringify(auth.error)}</div>}
      </form>
    </div>
  );
}
