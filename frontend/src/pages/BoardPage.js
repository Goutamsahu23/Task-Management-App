import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBoardById, createList, moveCardApi, reorderListsApi, renameBoardApi, inviteMemberApi
} from '../redux/boardSlice';
import ListColumn from '../components/ListColumn';

export default function BoardPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { activeBoard, loading } = useSelector(s => s.board);
  const [newListTitle, setNewListTitle] = useState('');
  const [renameTitle, setRenameTitle] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');

  useEffect(() => {
    dispatch(fetchBoardById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (activeBoard) setRenameTitle(activeBoard.title || '');
  }, [activeBoard]);

  const onDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;

    if (type === 'LIST') {
      const newLists = Array.from(activeBoard.lists);
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      const newOrder = newLists.map((l, idx) => ({ listId: l._id, position: idx }));
      const res = await dispatch(reorderListsApi({ boardId: activeBoard._id, order: newOrder }));
      if (res.meta.requestStatus === 'fulfilled') dispatch(fetchBoardById(id));
      return;
    }

    const cardId = draggableId;
    const toListId = destination.droppableId;
    const toPos = destination.index;
    const res = await dispatch(moveCardApi({ cardId, toListId, position: toPos }));
    if (res.meta.requestStatus === 'fulfilled') dispatch(fetchBoardById(id));
  }, [activeBoard, dispatch, id]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const res = await dispatch(createList({ boardId: id, title: newListTitle }));
    if (res.meta.requestStatus === 'fulfilled') {
      setNewListTitle('');
      dispatch(fetchBoardById(id));
    }
  };

  const handleRenameBoard = async (e) => {
    e.preventDefault();
    if (!renameTitle.trim()) return;
    const res = await dispatch(renameBoardApi({ boardId: id, title: renameTitle }));
    if (res.meta.requestStatus === 'fulfilled') dispatch(fetchBoardById(id));
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteUserId.trim()) return alert('Please provide userId to invite (backend requires userId).');
    const res = await dispatch(inviteMemberApi({ boardId: id, userId: inviteUserId, role: inviteRole }));
    if (res.meta.requestStatus === 'fulfilled') {
      setInviteUserId('');
      dispatch(fetchBoardById(id));
      alert('User invited');
    } else {
      alert(res.payload?.message || 'Invite failed');
    }
  };

  if (loading || !activeBoard) return <div className="container">Loading board...</div>;

  return (
    <div className="container">
      <div className="board-top">
        <div>
          <div className="board-title">{activeBoard.title}</div>
          <div className="small" style={{ marginTop:6 }}>{activeBoard.description || 'No description'}</div>
        </div>

        <div className='create-board-from'>
          <form onSubmit={handleRenameBoard} >
            <input className="input" value={renameTitle} onChange={e => setRenameTitle(e.target.value)} style={{ width:'100%' }} />
            <button className="btn primary" type="submit">Rename</button>
          </form>

          <form onSubmit={handleInvite} >
            <input className="input" placeholder="Invite userId" value={inviteUserId} onChange={e => setInviteUserId(e.target.value)} style={{ width:'100%' }} />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="input" style={{ width:120 }}>
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
            <button className="btn ghost" type="submit">Invite</button>
          </form>
        </div>
      </div>

      <form onSubmit={handleCreateList} style={{ marginBottom:14 }}>
        <input className="input" placeholder="Add list (column)" value={newListTitle} onChange={e => setNewListTitle(e.target.value)} style={{ width:'100%' }} />
        <button className="btn primary" style={{ marginLeft:10 }} type="submit">Add List</button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div className="lists-row" ref={provided.innerRef} {...provided.droppableProps}>
              {activeBoard.lists.map((list, index) => (
                <Draggable draggableId={list._id} index={index} key={list._id}>
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.draggableProps} style={{ ...prov.draggableProps.style }}>
                      <div {...prov.dragHandleProps} />
                      <div style={{ marginRight:12 }}>
                        <ListColumn list={list} boardId={activeBoard._id} onAction={() => dispatch(fetchBoardById(id))} />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
