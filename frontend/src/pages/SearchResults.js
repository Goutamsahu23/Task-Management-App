// src/pages/SearchResults.js
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery();
  const q = query.get('q') || '';
  const labels = query.get('labels') || '';
  const status = query.get('status') || '';
  const dueFrom = query.get('dueFrom') || '';
  const dueTo = query.get('dueTo') || '';
  const board = query.get('board') || '';

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      // If user has no filters and no query, nothing to show
      if (!q.trim() && !labels && !status && !dueFrom && !dueTo && !board) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params = { q };
        if (labels) params.labels = labels;
        if (status) params.status = status;
        if (dueFrom) params.dueFrom = dueFrom;
        if (dueTo) params.dueTo = dueTo;
        if (board) params.board = board;

        const res = await api.searchCards(params);
        setResults(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [q, labels, status, dueFrom, dueTo, board]);

  return (
    <div className="container">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Search results</h2>
        <div className="small">
          Query: <strong>{q}</strong>
          {labels && <> · Labels: {labels}</>}
          {status && <> · Status: {status}</>}
          {dueFrom && <> · From: {dueFrom}</>}
          {dueTo && <> · To: {dueTo}</>}
          {board && <> · Board: {board}</>}
        </div>
      </div>

      {loading && <div>Searching...</div>}
      {error && <div style={{ color:'red' }}>{error}</div>}
      {!loading && results.length === 0 && <div>No results</div>}

      <div style={{ marginTop:12, display:'grid', gap:12 }}>
        {results.map(card => (
          <div key={card._id} className="board-card" style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
            <div>
              <div style={{ fontWeight:700, color:'#eafcff' }}>{card.title}</div>
              <div className="small" style={{ marginTop:6, color:'#bcd7ee' }}>{card.description?.slice(0,200)}</div>
              <div className="small" style={{ marginTop:8 }}>Board: {card.boardTitle || card.board} · List: {card.listTitle || card.list}</div>
              <div style={{ marginTop:8 }}>{(card.labels || []).map(l => <span key={l} style={{ marginRight:8 }} className="badge badge--default">{l}</span>)}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Link to={`/board/${card.board}`} className="btn ghost">Open Board</Link>
              <button className="btn ghost" onClick={() => navigate(`/board/${card.board}?highlight=${card._id}`)}>Open & highlight</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
