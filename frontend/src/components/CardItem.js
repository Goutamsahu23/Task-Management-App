import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCardApi, deleteCardApi, addCommentApi } from '../redux/boardSlice';

export default function CardItem({ card, onAction }) {
  const dispatch = useDispatch();
  const authUser = useSelector(s => s.auth.user);
  const activeBoard = useSelector(s => s.board.activeBoard);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [labels, setLabels] = useState(card.labels || []);
  const [newLabel, setNewLabel] = useState('');
  const [dueDateInput, setDueDateInput] = useState(''); 
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    setTitle(card.title || '');
    setDescription(card.description || '');
    setLabels(card.labels || []);
    setNewLabel('');
    setCommentText('');
    setDueDateInput(card.dueDate ? toInputValue(card.dueDate) : '');
  }, [card]);

  // convert ISO date string to "YYYY-MM-DDTHH:mm" local string for <input type="datetime-local">
  function toInputValue(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  // take datetime-local value and convert to ISO string (UTC)
  function inputValueToISO(v) {
    if (!v) return null;
    // v is like "2025-10-03T14:30" (local time)
    const d = new Date(v);
    return d.toISOString();
  }


  function getAuthorName(c) {
    if (!c) return 'Someone';
    const author = c.author;
    if (!author) return 'Someone';

    // if populated object
    if (typeof author === 'object') {
      return author.name || author.email || 'Someone';
    }

    // if a string id, compare with current user
    if (typeof author === 'string') {
      if (authUser && authUser._id === author) return authUser.name || 'You';
      // try to find in board members
      if (activeBoard && Array.isArray(activeBoard.members)) {
        const m = activeBoard.members.find(mem => {
          const uid = mem.user && (mem.user._id || mem.user);
          return uid && (uid.toString() === author.toString());
        });
        if (m) return (m.user && (m.user.name || m.user.email)) || 'Member';
      }
      return 'Someone';
    }
    return 'Someone';
  }

  const saveChanges = async () => {
    setLoading(true);
    const updates = {
      title,
      description,
      labels,
      dueDate: dueDateInput ? inputValueToISO(dueDateInput) : null
    };
    const res = await dispatch(updateCardApi({ cardId: card._id, updates }));
    setLoading(false);
    if (res.meta.requestStatus === 'fulfilled') {
      if (onAction) onAction();
      setOpen(false);
    } else {
      alert(res.payload?.message || 'Failed to update card');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this card?')) return;
    setLoading(true);
    const res = await dispatch(deleteCardApi(card._id));
    setLoading(false);
    if (res.meta.requestStatus === 'fulfilled') {
      if (onAction) onAction();
      setOpen(false);
    } else {
      alert(res.payload?.message || 'Failed to delete card');
    }
  };

  const addLabel = () => {
    const v = newLabel.trim();
    if (!v) return;
    if (!labels.includes(v)) setLabels([...labels, v]);
    setNewLabel('');
  };

  // support pressing Enter in label input
  const onLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLabel();
    }
  };

  const removeLabel = (l) => setLabels(labels.filter(x => x !== l));

  const handleAddComment = async (e) => {
    e && e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    setCommentLoading(true);
    const res = await dispatch(addCommentApi({ cardId: card._id, text }));
    setCommentLoading(false);
    if (res.meta.requestStatus === 'fulfilled') {
      setCommentText('');
      if (onAction) onAction();
    } else {
      alert(res.payload?.message || 'Failed to add comment');
    }
  };

  const renderLabel = (label) => {
    const cls = label.toLowerCase().includes('infra') ? 'badge--infra' : label.toLowerCase().includes('urgent') ? 'badge--urgent' : 'badge--default';
    return <span key={label} className={`badge ${cls}`} style={{ marginRight:6 }}>{label}</span>;
  };

  return (
    <>
      <div style={{ position:'relative' }}>
        <div className="card-item" role="group" aria-label={`Card ${card.title}`}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ maxWidth:'82%' }}>
              <div className="card-title">{card.title}</div>
              <div className="card-desc small">{card.description ? card.description.slice(0,80) : ''}</div>
              <div style={{ marginTop:8 }}>{(card.labels || []).map(renderLabel)}</div>
            </div>

            {/* Edit pen button on right */}
            <div style={{ marginLeft:8 }}>
              <button
                className="btn ghost"
                onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                aria-label={`Edit ${card.title}`}
                title="Edit card"
                style={{ padding:'6px 8px', fontWeight:700 }}
              >
                ✎
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
              <div style={{ flex:1 }}>
                <input className="input" value={title} onChange={e=>setTitle(e.target.value)} style={{ fontSize:18, padding:12 }} />
                <textarea className="input textarea" value={description} onChange={e=>setDescription(e.target.value)} style={{ marginTop:12 }} />

                <div style={{ marginTop:12 }}>
                  <div className="small">Due date</div>
                  <input
                    type="datetime-local"
                    className="input"
                    value={dueDateInput}
                    onChange={e => setDueDateInput(e.target.value)}
                    style={{ marginTop:8 }}
                  />
                </div>

                <div style={{ marginTop:12 }}>
                  <div className="small">Labels</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:8, flexWrap:'wrap' }}>
                    {labels.map(l => (
                      <div key={l} style={{ display:'flex', gap:6, alignItems:'center' }}>
                        {renderLabel(l)}
                        <button className="btn ghost" onClick={() => removeLabel(l)} style={{ padding:'4px 6px' }}>x</button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', gap:8, marginTop:8 }}>
                    <input
                      className="input"
                      value={newLabel}
                      onKeyDown={onLabelKeyDown}
                      onChange={e=>setNewLabel(e.target.value)}
                      placeholder="Add label (press Enter)"
                    />
                    <button className="btn ghost" onClick={addLabel} type="button">Add</button>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <button className="btn primary" onClick={saveChanges} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button className="btn ghost" onClick={() => setOpen(false)}>Close</button>
                  <button className="btn ghost" onClick={handleDelete} disabled={loading}>Delete</button>
                </div>

                <hr style={{ margin:'14px 0' }} />

                <h4 style={{ margin:'6px 0' }}>Comments</h4>
                <div style={{ display:'grid', gap:8, marginTop:8 }}>
                  {(card.comments || []).length === 0 && <div className="small">No comments yet</div>}
                  {(card.comments || []).map(c => (
                    <div key={c._id || c.createdAt} style={{ background:'#06121a', padding:10, borderRadius:8 }}>
                      <div style={{ fontWeight:700 }}>{getAuthorName(c)}</div>
                      <div className="small" style={{ marginTop:6 }}>{c.text}</div>
                      <div className="small" style={{ marginTop:6 }}>{new Date(c.createdAt || c.at || Date.now()).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} style={{ display:'flex', gap:8, marginTop:10 }}>
                  <input className="input" placeholder="Write a comment..." value={commentText} onChange={e=>setCommentText(e.target.value)} />
                  <button className="btn primary" type="submit" disabled={commentLoading}>{commentLoading ? 'Adding...' : 'Add'}</button>
                </form>
              </div>

              <aside style={{ width:260 }}>
                <div style={{ background:'rgba(255,255,255,0.2)', padding:12, borderRadius:10 }}>
                  <div className="small">Due</div>
                  <div style={{ fontWeight:700, marginTop:6 }}>{card.dueDate ? new Date(card.dueDate).toLocaleString() : '—'}</div>
                </div>

                <div style={{ marginTop:12, background:'rgba(255,255,255,0.2)', padding:12, borderRadius:10 }}>
                  <div className="small">Activity</div>
                  <div className="small" style={{ marginTop:8 }}>
                    {(card.activity || []).slice(-8).reverse().map(a => <div key={a.at || a._id} style={{ marginTop:6 }}>{a.text}</div>)}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
