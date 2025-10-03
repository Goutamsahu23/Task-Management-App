import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchFilter({ open, onClose }) {
  const navigate = useNavigate();
  const query = useQuery();

  // preload from query string if present
  const [labels, setLabels] = useState(query.get('labels') || '');
  const [status, setStatus] = useState(query.get('status') || '');
  const [dueFrom, setDueFrom] = useState(query.get('dueFrom') || '');
  const [dueTo, setDueTo] = useState(query.get('dueTo') || '');
  const [board, setBoard] = useState(query.get('board') || '');

  useEffect(() => {
    if (!open) return;
    // keep state in sync if URL changed externally
    setLabels(query.get('labels') || '');
    setStatus(query.get('status') || '');
    setDueFrom(query.get('dueFrom') || '');
    setDueTo(query.get('dueTo') || '');
    setBoard(query.get('board') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const apply = (e) => {
    e && e.preventDefault();
    // Build query object
    const params = new URLSearchParams();
    const q = query.get('q');
    if (q) params.set('q', q);
    if (labels.trim()) params.set('labels', labels.trim());
    if (status) params.set('status', status);
    if (dueFrom) params.set('dueFrom', dueFrom);
    if (dueTo) params.set('dueTo', dueTo);
    if (board) params.set('board', board.trim());
    navigate(`/search?${params.toString()}`);
    if (onClose) onClose();
  };

  const clear = () => {
    setLabels('');
    setStatus('');
    setDueFrom('');
    setDueTo('');
    setBoard('');
    navigate(`/search?q=${encodeURIComponent(query.get('q') || '')}`);
    if (onClose) onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <h3 style={{ marginTop: 0 }}>Search filters</h3>

        <form onSubmit={apply} style={{ display: 'grid', gap: 10 }}>
          <label className="field">
            <div className="field-label">Board (title or id)</div>
            <input className="input" value={board} onChange={e => setBoard(e.target.value)} placeholder="Board title or id (optional)" />
          </label>

          <label className="field">
            <div className="field-label">Labels (comma separated)</div>
            <input className="input" value={labels} onChange={e => setLabels(e.target.value)} placeholder="e.g. infra,urgent,backend" />
            <div className="small">Matches any of the labels you enter.</div>
          </label>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className="field-label">Due from</div>
              <input className="input" type="date" value={dueFrom} onChange={e => setDueFrom(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="field-label">Due to</div>
              <input className="input" type="date" value={dueTo} onChange={e => setDueTo(e.target.value)} />
            </div>
          </div>



          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn ghost" onClick={clear}>Clear</button>
            <button type="submit" className="btn primary">Apply</button>
          </div>
        </form>
      </div>
    </div>
  );
}
