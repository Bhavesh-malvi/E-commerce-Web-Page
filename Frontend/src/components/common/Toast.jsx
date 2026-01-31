import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const { message, type } = toast;

  const styles = {
    success: {
      bg: 'bg-green-50 border-green-500',
      icon: <FaCheckCircle className="text-green-500" />,
      text: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-500',
      icon: <FaExclamationCircle className="text-red-500" />,
      text: 'text-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-500',
      icon: <FaExclamationCircle className="text-yellow-500" />,
      text: 'text-yellow-800'
    },
    info: {
      bg: 'bg-blue-50 border-blue-500',
      icon: <FaInfoCircle className="text-blue-500" />,
      text: 'text-blue-800'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div className={`${style.bg} border-l-4 p-4 rounded-lg shadow-lg min-w-[300px] max-w-md animate-slideIn`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>
        <div className={`flex-1 ${style.text} text-sm font-medium`}>
          {message}
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${style.text} hover:opacity-70 transition-opacity`}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};
