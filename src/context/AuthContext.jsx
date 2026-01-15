import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // Get user profile from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUser({
                            uid: firebaseUser.uid,
                            id: firebaseUser.uid, // Add id for compatibility
                            email: firebaseUser.email,
                            ...userDoc.data()
                        });
                    } else {
                        // Fallback if doc doesn't exist yet but user is authenticated
                        setUser({
                            uid: firebaseUser.uid,
                            id: firebaseUser.uid, // Add id for compatibility
                            email: firebaseUser.email
                        });
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth state observer error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Fetch user profile immediately for redirection purposes
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            let userData = {
                uid: userCredential.user.uid,
                email: userCredential.user.email
            };

            if (userDoc.exists()) {
                userData = { ...userData, ...userDoc.data() };
            }

            // Optimistically update user state
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const signup = async (email, password, profileData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const fullUserData = { ...user, ...profileData, email };

            // Save additional profile data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                ...profileData,
                email,
                createdAt: new Date().toISOString()
            });

            // Optimistically update user state
            setUser(fullUserData);
            return fullUserData;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    const updateUser = async (updates) => {
        if (!user) return;
        try {
            await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
            setUser(prev => ({ ...prev, ...updates }));
        } catch (error) {
            console.error('Update user error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, resetPassword, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
