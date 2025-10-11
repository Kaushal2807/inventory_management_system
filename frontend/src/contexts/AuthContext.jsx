import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const savedUser = localStorage.getItem('inventory_user');
                const savedToken = localStorage.getItem('inventory_token');

                if (savedUser && savedToken) {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                localStorage.removeItem('inventory_user');
                localStorage.removeItem('inventory_token');
            } finally {
                setInitialLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Simple login function - calls backend API
    const login = async (username, password) => {
        setLoading(true);

        try {
            const response = await authAPI.login({ username, password });
            const data = response.data;

            // Save user data and token
            localStorage.setItem('inventory_user', JSON.stringify(data.user));
            localStorage.setItem('inventory_token', data.token);

            // Update state
            setUser(data.user);

            return data.user;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem('inventory_user');
        localStorage.removeItem('inventory_token');
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user && !!localStorage.getItem('inventory_token');
    };

    const value = {
        user,
        loading,
        initialLoading,
        login,
        logout,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };