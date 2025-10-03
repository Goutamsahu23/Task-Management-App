import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import CardItem from './CardItem';
import { useDispatch } from 'react-redux';
import { createCard, renameListApi, deleteListApi } from '../redux/boardSlice';

export default function ListColumn({ list, boardId, onAction }) {
  const dispatch = useDispatch();
  const [newTitle, setNewTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(list.title || '');

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await dispatch(createCard({
      title: newTitle,
      description: '',
      listId: list._id
    }));
    if (res.meta.requestStatus === 'fulfilled') {
      setNewTitle('');
      setShowAdd(false);
      if (onAction) onAction();
    }
  };

  const handleRenameList = async () => {
    if (!titleValue.trim()) return;
    const res = await dispatch(renameListApi({ listId: list._id, title: titleValue }));
    if (res.meta.requestStatus === 'fulfilled') {
      setEditingTitle(false);
      if (onAction) onAction();
    } else {
      alert('Rename failed');
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Delete this list and its cards?')) return;
    const res = await dispatch(deleteListApi(list._id));
    if (res.meta.requestStatus === 'fulfilled') {
      if (onAction) onAction();
    } else {
      alert(res.payload?.message || 'Delete failed');
    }
  };

  return (
    <div className="list-column" aria-label={`List ${list.title}`}>
      <div className="list-head">
        {!editingTitle ? (
          <>
            <div>
              <div className="list-title">{list.title}</div>
              <div className="list-count small">{(list.cards || []).length} cards</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn ghost" onClick={() => setEditingTitle(true)}>Rename</button>
              <button className="btn ghost" onClick={handleDeleteList}>Delete</button>
            </div>
          </>
        ) : (
          <>
            <input className="input" value={titleValue} onChange={e => setTitleValue(e.target.value)} />
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn primary" onClick={handleRenameList}>Save</button>
              <button className="btn ghost" onClick={() => { setEditingTitle(false); setTitleValue(list.title); }}>Cancel</button>
            </div>
          </>
        )}
      </div>

      <Droppable droppableId={list._id} type="CARD">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight:40 }}>
            {list.cards && list.cards.map((card, index) => (
              <Draggable key={card._id} draggableId={card._id} index={index}>
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                    <CardItem card={card} onAction={onAction} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {!showAdd ? (
        <button className="btn ghost" onClick={() => setShowAdd(true)} style={{ marginTop:8 }}>+ Add card</button>
      ) : (
        <form onSubmit={handleAddCard} style={{ marginTop:8 }}>
          <input className="input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Card title" />
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <button className="btn primary" type="submit">Add</button>
            <button type="button" className="btn ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
