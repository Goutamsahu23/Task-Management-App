// src/components/CardItem.js
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { updateCardApi, deleteCardApi, addCommentApi } from '../redux/boardSlice';

/**
 * CardItem
 * Props:
 *  - card (object)
 *  - onAction() : callback to refresh parent (BoardPage should re-fetch board)
 */
export default function CardItem({ card, onAction }) {
  const dispatch = useDispatch();
  const authUser = useSelector(s => s.auth.user);
  const activeBoard = useSelector(s => s.board.activeBoard);

  // modal / edit state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [labels, setLabels] = useState(card.labels || []);
  const [newLabel, setNewLabel] = useState('');
  const [dueInput, setDueInput] = useState(card.dueDate ? toInputValue(card.dueDate) : '');
  const [loading, setLoading] = useState(false);

  // comments
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // attachments
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setTitle(card.title || '');
    setDescription(card.description || '');
    setLabels(card.labels || []);
    setDueInput(card.dueDate ? toInputValue(card.dueDate) : '');
  }, [card]);

  // helper: convert ISO to input value "YYYY-MM-DDTHH:mm"
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

  // convert input value to ISO or null
  function inputValueToISO(v) {
    if (!v) return null;
    const d = new Date(v);
    return d.toISOString();
  }

  // Save updates to card
  const saveChanges = async () => {
    setLoading(true);
    const updates = {
      title,
      description,
      labels,
      dueDate: dueInput ? inputValueToISO(dueInput) : null,
    };
    const res = await dispatch(updateCardApi({ cardId: card._id, updates }));
    setLoading(false);
    if (res.meta && res.meta.requestStatus === 'fulfilled') {
      if (onAction) onAction();
      setOpen(false);
    } else {
      alert(res.payload?.message || 'Failed to update card');
    }
  };

  // Delete card
  const handleDelete = async () => {
    if (!window.confirm('Delete this card?')) return;
    setLoading(true);
    const res = await dispatch(deleteCardApi(card._id));
    setLoading(false);
    if (res.meta && res.meta.requestStatus === 'fulfilled') {
      if (onAction) onAction();
      setOpen(false);
    } else {
      alert(res.payload?.message || 'Failed to delete card');
    }
  };

  // Comments
  const handleAddComment = async (e) => {
    e && e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    setCommentLoading(true);
    const res = await dispatch(addCommentApi({ cardId: card._id, text }));
    setCommentLoading(false);
    if (res.meta && res.meta.requestStatus === 'fulfilled') {
      setCommentText('');
      if (onAction) onAction();
    } else {
      alert(res.payload?.message || 'Failed to add comment');
    }
  };

  // Labels
  const addLabel = () => {
    const v = newLabel.trim();
    if (!v) return;
    if (!labels.includes(v)) setLabels([...labels, v]);
    setNewLabel('');
  };
  const onLabelKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } };
  const removeLabel = (l) => setLabels(labels.filter(x => x !== l));

  // Attachments: choose files
  const handleChooseFiles = () => fileInputRef.current?.click();

  const handleFilesSelected = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const form = new FormData();
      for (let i = 0; i < files.length; i++) form.append('files', files[i]);

      const onUploadProgress = (progressEvent) => {
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        }
      };

      await api.uploadAttachment(card._id, form, onUploadProgress);
      // refresh parent so attachments appear
      if (onAction) onAction();
    } catch (err) {
      console.error('upload error', err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = ''; // reset file input
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Delete attachment?')) return;
    try {
      await api.deleteAttachment(card._id, attachmentId);
      if (onAction) onAction();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // Render helpers
  const renderLabel = (label) => {
    const cls = label.toLowerCase().includes('infra') ? 'badge--infra'
      : label.toLowerCase().includes('urgent') ? 'badge--urgent'
      : 'badge--default';
    return <span key={label} className={`badge ${cls}`} style={{ marginRight: 6 }}>{label}</span>;
  };

  // Resolve comment author name robustly
  const getAuthorName = (c) => {
    if (!c) return 'Someone';
    const author = c.author;
    if (!author) return 'Someone';
    if (typeof author === 'object') return author.name || author.email || 'Someone';
    if (typeof author === 'string') {
      if (authUser && authUser._id === author) return authUser.name || 'You';
      if (activeBoard && Array.isArray(activeBoard.members)) {
        const m = activeBoard.members.find(mem => {
          const uid = mem.user && (mem.user._id || mem.user);
          return uid && uid.toString() === author.toString();
        });
        if (m) return (m.user && (m.user.name || m.user.email)) || 'Member';
      }
      return 'Someone';
    }
    return 'Someone';
  };

  return (
    <>
      {/* Card preview with edit pen button */}
      <div style={{ position: 'relative' }}>
        <div className="card-item" role="group" aria-label={`Card ${card.title}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: '82%' }}>
              <div className="card-title">{card.title}</div>
              <div className="card-desc small">{card.description ? card.description.slice(0, 80) : ''}</div>
              <div style={{ marginTop: 8 }}>{(card.labels || []).map(renderLabel)}</div>
            </div>

            <div style={{ marginLeft: 8 }}>
              <button
                className="btn ghost"
                onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                aria-label={`Edit ${card.title}`}
                title="Edit card"
                style={{ padding: '6px 8px', fontWeight: 700 }}
              >
                ✎
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} style={{ fontSize: 18, padding: 12 }} />
                <textarea className="input textarea" value={description} onChange={e => setDescription(e.target.value)} style={{ marginTop: 12 }} />

                <div style={{ marginTop: 12 }}>
                  <div className="small">Due date</div>
                  <input
                    type="datetime-local"
                    className="input"
                    value={dueInput}
                    onChange={e => setDueInput(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="small">Labels</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                    {labels.map(l => (
                      <div key={l} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {renderLabel(l)}
                        <button className="btn ghost" onClick={() => removeLabel(l)} style={{ padding: '4px 6px' }}>x</button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      className="input"
                      value={newLabel}
                      onKeyDown={onLabelKeyDown}
                      onChange={e => setNewLabel(e.target.value)}
                      placeholder="Add label (press Enter)"
                    />
                    <button className="btn ghost" onClick={addLabel} type="button">Add</button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn primary" onClick={saveChanges} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button className="btn ghost" onClick={() => setOpen(false)}>Close</button>
                  <button className="btn ghost" onClick={handleDelete} disabled={loading}>Delete</button>
                </div>

                <hr style={{ margin: '14px 0' }} />

                {/* Attachments */}
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>Attachments</div>
                    <div>
                      <button className="btn ghost" onClick={handleChooseFiles} disabled={uploading}>
                        {uploading ? `Uploading ${uploadProgress}%` : 'Upload'}
                      </button>
                      <input ref={fileInputRef} type="file" style={{ display: 'none' }} multiple onChange={handleFilesSelected} />
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                    {(card.attachments || []).length === 0 ? (
                      <div className="small">No attachments</div>
                    ) : (
                      (card.attachments || []).map(att => (
                        <div key={att._id || att.filename} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#06121a', padding: 8, borderRadius: 8 }}>
                          <div>
                            <a href={att.url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: '#bfe8ff' }}>
                              {att.originalname || att.filename}
                            </a>
                            <div className="small">{att.mimetype} · {(att.size / 1024).toFixed(1)} KB</div>
                            <div className="small">Uploaded: {att.uploadedBy?.name || att.uploadedBy?.email || ''} · {att.createdAt ? new Date(att.createdAt).toLocaleString() : ''}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <a className="btn ghost" href={att.url} target="_blank" rel="noreferrer">Download</a>
                            <button className="btn ghost" onClick={() => handleDeleteAttachment(att._id)}>Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <hr style={{ margin: '14px 0' }} />

                {/* Comments */}
                <h4 style={{ margin: '6px 0' }}>Comments</h4>
                <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                  {(card.comments || []).length === 0 && <div className="small">No comments yet</div>}
                  {(card.comments || []).map(c => (
                    <div key={c._id || c.createdAt} style={{ background: '#06121a', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontWeight: 700 }}>{getAuthorName(c)}</div>
                      <div className="small" style={{ marginTop: 6 }}>{c.text}</div>
                      <div className="small" style={{ marginTop: 6 }}>{new Date(c.createdAt || c.at || Date.now()).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input className="input" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                  <button className="btn primary" type="submit" disabled={commentLoading}>{commentLoading ? 'Adding...' : 'Add'}</button>
                </form>
              </div>

              {/* Right sidebar */}
              <aside style={{ width: 260 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10 }}>
                  <div className="small">Due</div>
                  <div style={{ fontWeight: 700, marginTop: 6 }}>{card.dueDate ? new Date(card.dueDate).toLocaleString() : '—'}</div>
                </div>

                <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10 }}>
                  <div className="small">Activity</div>
                  <div className="small" style={{ marginTop: 8 }}>
                    {(card.activity || []).slice(-8).reverse().map(a => <div key={a.at || a._id} style={{ marginTop: 6 }}>{a.text}</div>)}
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
