import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fc_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fc_token') || null);
  const [loading, setLoading] = useState(true);

  // Auto-verify token on mount or token change
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            localStorage.setItem('fc_user', JSON.stringify(res.data.user));
            connectSocket(token);
          }
        } catch (err) {
          console.error('Failed to fetch user me:', err);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const res = await API.post('/auth/login', { username: usernameOrEmail, password });
    if (res.data.success && res.data.token) {
      const authToken = res.data.token;
      const loggedUser = res.data.user;
      const loggedProfile = res.data.profile;

      localStorage.setItem('fc_token', authToken);
      localStorage.setItem('fc_user', JSON.stringify(loggedUser));

      setToken(authToken);
      setUser(loggedUser);
      setProfile(loggedProfile);

      connectSocket(authToken);
      return { success: true, user: loggedUser };
    }
    return { success: false, message: res.data.message };
  };

  const googleLogin = async (payload) => {
    // payload can be { idToken } or { credential } or { email, name, role }
    const reqBody = typeof payload === 'string' ? { idToken: payload } : payload;
    const res = await API.post('/auth/google', reqBody);
    if (res.data.success && res.data.token) {
      const authToken = res.data.token;
      const loggedUser = res.data.user;
      const loggedProfile = res.data.profile;

      localStorage.setItem('fc_token', authToken);
      localStorage.setItem('fc_user', JSON.stringify(loggedUser));

      setToken(authToken);
      setUser(loggedUser);
      setProfile(loggedProfile);

      connectSocket(authToken);
      return { success: true, user: loggedUser, isNewUser: res.data.isNewUser };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    if (res.data.success && res.data.token) {
      const authToken = res.data.token;
      const loggedUser = res.data.user;
      const loggedProfile = res.data.profile;

      localStorage.setItem('fc_token', authToken);
      localStorage.setItem('fc_user', JSON.stringify(loggedUser));

      setToken(authToken);
      setUser(loggedUser);
      setProfile(loggedProfile);

      connectSocket(authToken);
      return { success: true, user: loggedUser };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    localStorage.removeItem('fc_token');
    localStorage.removeItem('fc_user');
    setToken(null);
    setUser(null);
    setProfile(null);
    disconnectSocket();
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('fc_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        role: user?.role || null,
        loading,
        login,
        googleLogin,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
