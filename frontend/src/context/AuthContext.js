import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartplate_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('smartplate_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credential) => {
    try {
      const response = await axios.post(`${API}/auth/google`, { credential });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('smartplate_token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const verifyPhone = async (phone, otp) => {
    try {
      const response = await axios.post(
        `${API}/auth/verify-phone`,
        { phone, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(prev => ({ ...prev, phone, phone_verified: true }));
      return response.data;
    } catch (error) {
      console.error('Phone verification error:', error);
      throw error;
    }
  };

  const selectRole = async (role) => {
    try {
      const response = await axios.post(
        `${API}/auth/select-role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      localStorage.setItem('smartplate_token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('Role selection error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('smartplate_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      verifyPhone,
      selectRole,
      refreshUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
