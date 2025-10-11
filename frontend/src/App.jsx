import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Profile from './pages/Auth/Profile';
import Dashboard from './pages/Dashboard/Dashboard';
import Items from './pages/Items/Items';
import Categories from './pages/Categories/Categories';
import StockMovements from './pages/StockMovements/StockMovements';
import Payment from './pages/Payment/Payment';
import AddItem from './pages/Items/AddItem';
import EditItem from './pages/Items/EditItem';
import AddCategory from './pages/Categories/AddCategory';
import EditCategory from './pages/Categories/EditCategory';
import { GlobalStyle } from './styles/GlobalStyle';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalStyle />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/items" element={
            <ProtectedRoute>
              <Layout>
                <Items />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/items/add" element={
            <ProtectedRoute>
              <Layout>
                <AddItem />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/items/edit/:id" element={
            <ProtectedRoute>
              <Layout>
                <EditItem />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/categories" element={
            <ProtectedRoute>
              <Layout>
                <Categories />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/categories/add" element={
            <ProtectedRoute>
              <Layout>
                <AddCategory />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/categories/edit/:id" element={
            <ProtectedRoute>
              <Layout>
                <EditCategory />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/stock-movements" element={
            <ProtectedRoute>
              <Layout>
                <StockMovements />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/payment" element={
            <ProtectedRoute>
              <Layout>
                <Payment />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
