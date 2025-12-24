import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('oga_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData) => {
        // userData should include { name, email, type ('hirer' | 'labourer'), ... }
        setUser(userData);
        localStorage.setItem('oga_user', JSON.stringify(userData));
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
        <AuthContext.Provider value={{ user, login, demoLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
