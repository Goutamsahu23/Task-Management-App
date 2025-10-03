import React from 'react';
import SearchResults from './pages/SearchResults';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/BoardPage';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
    const token = useSelector(s => s.auth.token);
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

function App() {
    return (
        <>
            <Navbar />
            <div className="container app-body">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/board/:id" element={
                        <ProtectedRoute>
                            <BoardPage />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="/search" element={
                        <ProtectedRoute>
                            <SearchResults />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </>
    );
}

export default App;
