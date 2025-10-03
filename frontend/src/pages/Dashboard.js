
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoards, createBoard } from '../redux/boardSlice';
import BoardCard from '../components/BoardCard';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, loading } = useSelector(s => s.board);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // NEW

  useEffect(() => { dispatch(fetchBoards()); }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    // send both title and description
    const res = await dispatch(createBoard({ title, description }));
    if (res.meta.requestStatus === 'fulfilled') {
      setTitle('');
      setDescription('');
      navigate(`/board/${res.payload._id}`);
    }
  };

  return (
    <div className="container">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginTop:18 }}>
        <div>
          <h2 style={{ margin:0, fontSize:28, fontWeight:800, color:'#f8feff' }}>Your Boards</h2>
          <div className="small" style={{ marginTop:6 }}>Organize projects and collaborate with your team</div>
        </div>

        <form onSubmit={handleCreate} className='create-board-from'>
          <input className="input" placeholder="Board title" value={title} onChange={e=>setTitle(e.target.value)} style={{ width:220 }} />
          <input className="input" placeholder="Short description (optional)" value={description} onChange={e=>setDescription(e.target.value)} style={{ width:'100%' }} />
          <button className="btn primary" type="submit">Create board</button>
        </form>
      </div>

      <div style={{ marginTop:18 }}>
        {loading ? <div>Loading...</div> : (
          <div className="board-grid" role="list">
            {boards.length === 0 && <div style={{ gridColumn:'1/-1' }}><em className="small">No boards yet — create one to get started</em></div>}
            {boards.map(b => <BoardCard key={b._id} board={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}
