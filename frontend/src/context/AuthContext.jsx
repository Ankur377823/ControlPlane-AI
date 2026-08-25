import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, googleLoginUser, fetchUsers, approveUser, rejectUser } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('cp_user') || localStorage.getItem('cp_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem('cp_user');
        sessionStorage.removeItem('cp_user');
      }
    }
    return null;
  });

  const [activeTenant, setActiveTenant] = useState(() => {
    return user?.tenant_id || 'ankur-tenant-1';
  });

  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (user?.tenant_id) {
      setActiveTenant(user.tenant_id);
    }
  }, [user]);

  const login = async (username, password, remember = false) => {
    try {
      const userData = await loginUser(username, password);
      if (!userData || (!userData.token && !userData.id)) {
        throw new Error('Invalid credentials');
      }

      const jsonStr = JSON.stringify(userData);
      if (remember) {
        localStorage.setItem('cp_user', jsonStr);
        sessionStorage.removeItem('cp_user');
      } else {
        sessionStorage.setItem('cp_user', jsonStr);
        localStorage.removeItem('cp_user');
      }

      setUser(userData);
      setActiveTenant(userData.tenant_id || 'ankur-tenant-1');
      showToast(`Welcome back, ${userData.name || userData.username}!`, 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      return false;
    }
  };

  const googleLogin = async (email, name) => {
    try {
      const userData = await googleLoginUser(email, name);
      const jsonStr = JSON.stringify(userData);
      sessionStorage.setItem('cp_user', jsonStr);
      setUser(userData);
      setActiveTenant(userData.tenant_id || 'ankur-tenant-1');
      showToast(`Google Sign-In successful as ${userData.name}!`, 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Google Login failed', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('cp_user');
    sessionStorage.removeItem('cp_user');
    setUser(null);
    showToast('Signed out of ControlPlane AI', 'info');
  };

  const switchAccount = (newUser) => {
    const jsonStr = JSON.stringify(newUser);
    sessionStorage.setItem('cp_user', jsonStr);
    setUser(newUser);
    setActiveTenant(newUser.tenant_id || 'ankur-tenant-1');
    setIsUserMgmtOpen(false);
    showToast(`Switched active account to ${newUser.name || newUser.username} (${newUser.role})`, 'success');
  };

  const changeActiveTenant = (newTenantId) => {
    setActiveTenant(newTenantId);
    if (user) {
      const updated = { ...user, tenant_id: newTenantId };
      setUser(updated);
      const isRem = !!localStorage.getItem('cp_user');
      if (isRem) {
        localStorage.setItem('cp_user', JSON.stringify(updated));
      } else {
        sessionStorage.setItem('cp_user', JSON.stringify(updated));
      }
    }
    showToast(`Switched active tenant workspace to: ${newTenantId}`, 'cyan');
  };

  const isAdmin = !!(
    user &&
    (user.role === 'ADMIN' ||
      user.username === 'admin' ||
      user.username === 'ankur' ||
      (user.email && (user.email.includes('admin') || user.email.includes('ankur'))))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        activeTenant,
        login,
        googleLogin,
        logout,
        switchAccount,
        changeActiveTenant,
        isUserMgmtOpen,
        setIsUserMgmtOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
