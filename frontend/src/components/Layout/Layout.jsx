import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 250px;
  padding: 20px;
  background-color: #f8f9fa;
`;

const Layout = ({ children }) => {
    return (
        <LayoutContainer>
            <Sidebar />
            <div style={{ flex: 1 }}>
                <Header />
                <MainContent>
                    {children}
                </MainContent>
            </div>
        </LayoutContainer>
    );
};

export default Layout;