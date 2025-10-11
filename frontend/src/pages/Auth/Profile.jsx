import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 auto 1rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const ProfileName = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const ProfileBody = styled.div`
  padding: 2rem;
`;

const InfoItem = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  margin-bottom: 1rem;
`;

const InfoLabel = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const InfoValue = styled.div`
  color: #666;
  font-size: 1rem;
`;

const Profile = () => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const getUserInitials = (name) => {
        if (!name) return 'U';
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <ProfileContainer>
            <ProfileCard>
                <ProfileHeader>
                    <Avatar>{getUserInitials(user.username)}</Avatar>
                    <ProfileName>@{user.username}</ProfileName>
                </ProfileHeader>

                <ProfileBody>
                    <InfoItem>
                        <InfoLabel>Username</InfoLabel>
                        <InfoValue>@{user.username}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>User ID</InfoLabel>
                        <InfoValue>#{user.id}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Login Time</InfoLabel>
                        <InfoValue>{new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                        <InfoLabel>Session Status</InfoLabel>
                        <InfoValue style={{ color: '#27ae60', fontWeight: '600' }}>Active</InfoValue>
                    </InfoItem>
                </ProfileBody>
            </ProfileCard>
        </ProfileContainer>
    );
};

export default Profile;