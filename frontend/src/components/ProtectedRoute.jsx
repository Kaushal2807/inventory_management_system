import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 1rem;
`;

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, initialLoading } = useAuth();
    const location = useLocation();

    // Show loading while checking authentication status
    if (initialLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Loading...</LoadingText>
            </LoadingContainer>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the protected component
    return children;
};

export default ProtectedRoute;