import React, { useState, useEffect, useCallback } from 'react';
import { BsCheckCircleFill, BsExclamationTriangleFill, BsInfoCircleFill } from 'react-icons/bs';

const ToastNotification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  }, [onClose]);
  
  useEffect(() => {
    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress - (100 / (duration / 100));
        return newProgress > 0 ? newProgress : 0;
      });
    }, 100);
    
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, handleClose]);
  
  const getIcon = () => {
    switch(type) {
      case 'success':
        return <BsCheckCircleFill size={18} className="text-success" />;
      case 'error':
        return <BsExclamationTriangleFill size={18} className="text-danger" />;
      case 'warning':
        return <BsExclamationTriangleFill size={18} className="text-warning" />;
      default:
        return <BsInfoCircleFill size={18} className="text-primary" />;
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className={`toast-notification ${type} ${visible ? 'show' : 'hide'}`}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center">
          {getIcon()}
          <span className="ms-2 fw-bold toast-title">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        </div>
        <button className="btn-close btn-close-sm" onClick={handleClose}></button>
      </div>
      
      <p className="mb-2">{message}</p>
      
      <div className="toast-progress-container">
        <div 
          className="toast-progress-bar" 
          style={{ 
            width: `${progress}%`,
            backgroundColor: type === 'success' ? 'var(--success-color)' : 
                             type === 'error' ? 'var(--danger-color)' :
                             type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'
          }}
        ></div>
      </div>
    </div>
  );
};

export default ToastNotification;
