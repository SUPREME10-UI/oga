import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('oga_user');
            console.log('AuthContext: Initializing user from localStorage:', savedUser);
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('oga_user');
            return null;
        }
    });

    const login = (userData) => {
        // userData should include { name, email, type ('hirer' | 'labourer'), ... }
        console.log('AuthContext: login called with:', userData);
        setUser(userData);
        localStorage.setItem('oga_user', JSON.stringify(userData));
        console.log('AuthContext: user state updated and saved to localStorage');
    };

    const updateUser = (updates) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            localStorage.setItem('oga_user', JSON.stringify(updated));
            return updated;
        });
    };

    const demoLogin = (role) => {
        const demoUser = {
            name: role === 'hirer' ? 'Demo Hirer' : 'Demo Labourer',
            email: role === 'hirer' ? 'hirer@demo.com' : 'labourer@demo.com',
            type: role,
            id: 'demo-123',
            location: 'Accra, Ghana'
        };
        login(demoUser);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('oga_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, demoLogin, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
