import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.nav`
  width: 250px;
  background-color: #2c3e50;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  padding: 20px 0;
  z-index: 1000;
`;

const Logo = styled.div`
  padding: 0 20px 30px;
  border-bottom: 1px solid #34495e;
  margin-bottom: 20px;
`;

const LogoText = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #ecf0f1;
`;

const MenuList = styled.ul`
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  border-bottom: 1px solid #34495e;
`;

const MenuLink = styled(Link)`
  display: block;
  padding: 15px 20px;
  color: ${props => props.$active ? '#3498db' : '#ecf0f1'};
  background-color: ${props => props.$active ? '#34495e' : 'transparent'};
  transition: all 0.3s ease;
  font-weight: ${props => props.$active ? '600' : '400'};

  &:hover {
    background-color: #34495e;
    color: #3498db;
  }

  svg {
    margin-right: 10px;
    width: 18px;
    height: 18px;
  }
`;

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '📊 Dashboard' },
    { path: '/categories', label: '🏷️ Categories' },
    { path: '/items', label: '📦 Items' },
    { path: '/stock-movements', label: '📈 Stock In/Out' },
    { path: '/payment', label: '💳 Payment' },
  ];

  return (
    <SidebarContainer>
      <Logo>
        <LogoText>Inventory System</LogoText>
      </Logo>
      <MenuList>
        {menuItems.map((item) => (
          <MenuItem key={item.path}>
            <MenuLink
              to={item.path}
              $active={location.pathname === item.path}
            >
              {item.label}
            </MenuLink>
          </MenuItem>
        ))}
      </MenuList>
    </SidebarContainer>
  );
};

export default Sidebar;