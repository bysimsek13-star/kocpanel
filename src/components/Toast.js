import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const ToastContext = createContext();

function ToastItem({ t }) {
  const { s } = useTheme();
  const bg = t.tip === 'success' ? s.success : t.tip === 'error' ? s.danger : s.warning;
  return (
    <div
      style={{
        background: bg,
        color: s.buttonText ?? '#fff',
        padding: '12px 20px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: s.shadowCard ?? s.shadow,
        animation: 'toastIn .3s ease',
        maxWidth: 340,
      }}
    >
      {t.mesaj}
    </div>
  );
}

let _id = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((mesaj, tip = 'success', sure = 3000) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, mesaj, tip }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), sure);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} t={t} />
        ))}
      </div>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
