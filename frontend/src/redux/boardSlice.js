
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// --- Boards ---
export const fetchBoards = createAsyncThunk('board/fetchBoards', async (_, { rejectWithValue }) => {
  try {
    const res = await api.getBoards();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const createBoard = createAsyncThunk('board/createBoard', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.createBoard(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const deleteBoard = createAsyncThunk('board/deleteBoard', async (boardId, { rejectWithValue }) => {
  try {
    const res = await api.deleteBoard(boardId);
    return { boardId, data: res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const fetchBoardById = createAsyncThunk('board/fetchBoardById', async (boardId, { rejectWithValue }) => {
  try {
    const res = await api.getBoard(boardId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const renameBoardApi = createAsyncThunk('board/renameBoard', async ({ boardId, title, description }, { rejectWithValue }) => {
  try {
    const res = await api.renameBoard(boardId, { title, description });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const inviteMemberApi = createAsyncThunk('board/inviteMember', async ({ boardId, userId, role }, { rejectWithValue }) => {
  try {
    const res = await api.inviteMember(boardId, { userId, role });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

// <-- MISSING thunk: changeMemberRoleApi -->
export const changeMemberRoleApi = createAsyncThunk('board/changeMemberRole', async ({ boardId, userId, role }, { rejectWithValue }) => {
  try {
    const res = await api.changeMemberRole(boardId, { userId, role });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

// --- Lists ---
export const createList = createAsyncThunk('board/createList', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.createList(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const renameListApi = createAsyncThunk('board/renameList', async ({ listId, title }, { rejectWithValue }) => {
  try {
    const res = await api.renameList(listId, { title });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const deleteListApi = createAsyncThunk('board/deleteList', async (listId, { rejectWithValue }) => {
  try {
    const res = await api.deleteList(listId);
    return { listId, data: res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const reorderListsApi = createAsyncThunk('board/reorderLists', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.reorderLists(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

// --- Cards ---
export const createCard = createAsyncThunk('board/createCard', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.createCard(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

// update card
export const updateCardApi = createAsyncThunk('board/updateCard', async ({ cardId, updates }, { rejectWithValue }) => {
  try {
    const res = await api.updateCard(cardId, updates);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

// delete card
export const deleteCardApi = createAsyncThunk('board/deleteCard', async (cardId, { rejectWithValue }) => {
  try {
    const res = await api.deleteCard(cardId);
    return { cardId, data: res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

// move card (drag/drop)
export const moveCardApi = createAsyncThunk('board/moveCard', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.moveCard(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

// add comment
export const addCommentApi = createAsyncThunk('board/addComment', async ({ cardId, text }, { rejectWithValue }) => {
  try {
    const res = await api.addComment(cardId, { text });
    return res.data; // backend returns updated card
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    boards: [],
    activeBoard: null,
    loading: false,
    error: null
  },
  reducers: {
    clearActiveBoard(state) { state.activeBoard = null; }
  },
  extraReducers: (builder) => {
    builder
      // fetch boards
      .addCase(fetchBoards.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBoards.fulfilled, (s, a) => { s.loading = false; s.boards = a.payload; })
      .addCase(fetchBoards.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      // create board
      .addCase(createBoard.fulfilled, (s, a) => { s.boards.push(a.payload); })

      // delete board
      .addCase(deleteBoard.fulfilled, (s, a) => {
        s.boards = s.boards.filter(b => b._id !== a.payload.boardId);
        if (s.activeBoard && s.activeBoard._id === a.payload.boardId) s.activeBoard = null;
      })

      // fetch board by id
      .addCase(fetchBoardById.pending, (s) => { s.loading = true; })
      .addCase(fetchBoardById.fulfilled, (s, a) => { s.loading = false; s.activeBoard = a.payload; })
      .addCase(fetchBoardById.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

      // rename board
      .addCase(renameBoardApi.fulfilled, (s, a) => {
        s.boards = s.boards.map(b => b._id === a.payload._id ? a.payload : b);
        if (s.activeBoard && s.activeBoard._id === a.payload._id) s.activeBoard = a.payload;
      })

      // invites / change role
      .addCase(inviteMemberApi.fulfilled, (s, a) => {
        if (s.activeBoard && s.activeBoard._id === a.payload._id) s.activeBoard = a.payload;
      })
      .addCase(changeMemberRoleApi.fulfilled, (s, a) => {
        if (s.activeBoard && s.activeBoard._id === a.payload._id) s.activeBoard = a.payload;
      })

      // lists
      .addCase(createList.fulfilled, (s, a) => {
        if (!s.activeBoard) return;
        s.activeBoard.lists.push(a.payload);
      })
      .addCase(renameListApi.fulfilled, (s, a) => {
        if (!s.activeBoard) return;
        s.activeBoard.lists = s.activeBoard.lists.map(l => l._id === a.payload._id ? a.payload : l);
      })
      .addCase(deleteListApi.fulfilled, (s, a) => {
        if (!s.activeBoard) return;
        s.activeBoard.lists = s.activeBoard.lists.filter(l => l._id !== a.payload.listId);
      })
      .addCase(reorderListsApi.fulfilled, (s, a) => {
        if (!s.activeBoard) return;
        s.activeBoard.lists = a.payload;
      })

      // cards
      .addCase(createCard.fulfilled, (s, a) => {
        if (!s.activeBoard) return;
        const list = s.activeBoard.lists.find(l => l._id === a.payload.list);
        if (list) list.cards.push(a.payload);
      })

      .addCase(updateCardApi.fulfilled, (s, a) => {
        if (!s.activeBoard) return;
        s.activeBoard.lists = s.activeBoard.lists.map(list => ({
          ...list,
          cards: (list.cards || []).map(c => c._id === a.payload._id ? a.payload : c)
        }));
      })

      .addCase(deleteCardApi.fulfilled, (s, a) => {
        if (!s.activeBoard) return;
        s.activeBoard.lists = s.activeBoard.lists.map(list => ({
          ...list,
          cards: (list.cards || []).filter(c => c._id !== a.payload.cardId)
        }));
      })

      .addCase(moveCardApi.fulfilled, (s) => {
        
      })

      // comments
      .addCase(addCommentApi.fulfilled, (s, a) => {
        if (!s.activeBoard) return;
        // a.payload is the updated card
        s.activeBoard.lists = s.activeBoard.lists.map(list => ({
          ...list,
          cards: (list.cards || []).map(c => c._id === a.payload._id ? a.payload : c)
        }));
      })

      ;
  }
});

export const { clearActiveBoard } = boardSlice.actions;
export default boardSlice.reducer;
