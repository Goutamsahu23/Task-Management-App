import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const dispatch = useDispatch();
  const auth = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (auth.token) navigate('/');
  }, [auth.token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(register({ name, email, password }));
    if (res.meta.requestStatus === 'fulfilled') navigate('/');
  };

  return (
    <div className="login-card">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:12 }}>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
        <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button className="btn btn-primary" type="submit" disabled={auth.loading}>Create</button>
        {auth.error && <div style={{ color:'red' }}>{auth.error.message || JSON.stringify(auth.error)}</div>}
      </form>
    </div>
  );
}
