import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UnauthorizedContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 20px;
`;

const UnauthorizedCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  color: #e74c3c;
  margin-bottom: 1rem;
  font-size: 2rem;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryButton = styled(Button)`
  background: #667eea;
  color: white;

  &:hover {
    background: #5a6fd8;
  }
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;
  color: white;

  &:hover {
    background: #5a6268;
  }
`;

const UserInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #667eea;
`;

const UserInfoTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
`;

const UserInfoText = styled.p`
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const Unauthorized = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <UnauthorizedContainer>
            <UnauthorizedCard>
                <Icon>🚫</Icon>
                <Title>Access Denied</Title>
                <Message>
                    Sorry, you don't have permission to access this page.
                    Your current role may not have the required privileges to view this content.
                </Message>

                {user && (
                    <UserInfo>
                        <UserInfoTitle>👤 Current User Information</UserInfoTitle>
                        <UserInfoText><strong>Username:</strong> {user.username}</UserInfoText>
                        <UserInfoText><strong>Role:</strong> {user.role}</UserInfoText>
                        <UserInfoText><strong>Display Name:</strong> {user.name}</UserInfoText>
                    </UserInfo>
                )}

                <ButtonGroup>
                    <PrimaryButton onClick={handleGoHome}>
                        🏠 Go to Dashboard
                    </PrimaryButton>
                    <SecondaryButton onClick={handleGoBack}>
                        ⬅️ Go Back
                    </SecondaryButton>
                    <SecondaryButton onClick={handleLogout}>
                        🚪 Logout
                    </SecondaryButton>
                </ButtonGroup>
            </UnauthorizedCard>
        </UnauthorizedContainer>
    );
};

export default Unauthorized;