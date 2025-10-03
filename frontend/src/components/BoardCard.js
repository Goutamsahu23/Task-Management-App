import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteBoard } from '../redux/boardSlice';

export default function BoardCard({ board }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOpen = () => navigate(`/board/${board._id}`);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this board? This will remove its lists & cards.')) return;
    const res = await dispatch(deleteBoard(board._id));
    if (res.meta.requestStatus !== 'fulfilled') {
      alert(res.payload?.message || 'Failed to delete board');
    }
  };

  return (
    <div className="board-card" onClick={handleOpen} role="listitem" aria-label={`Open ${board.title}`}>
      <div>
        <div className="title">{board.title}</div>
        <div className="desc">{board.description || 'No description'}</div>
      </div>

      <div className="board-meta">
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ display:'flex', gap:6 }}>
            {(board.members || []).slice(0,3).map((m,i) => (
              <div key={i} title={m.user?.name || 'Member'} style={{
                width:28, height:28, borderRadius:8, background:'#05223a', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:'#dbeffd'
              }}>
                {m.user?.name ? m.user.name[0].toUpperCase() : (m.user?.email?.[0] || 'U')}
              </div>
            ))}
          </div>
          <div className="small">{(board.members || []).length} members</div>
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button
          className="btn ghost"
          style={{ color: 'red' }}
          onClick={handleDelete}
          title="Delete Board"
        >
          Delete
        </button>
        </div>
      </div>
    </div>
  );
}
