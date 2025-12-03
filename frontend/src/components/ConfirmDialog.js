import React from 'react';

function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  type = 'danger' // 'danger', 'warning', 'info'
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch(type) {
      case 'danger': return '🗑️';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div 
      className="confirm-dialog-overlay" 
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-dialog-icon ${type}`} aria-hidden="true">
          {getIcon()}
        </div>
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
        <p id="confirm-dialog-message" className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-btn cancel"
            onClick={onCancel}
            aria-label={`${cancelText} and close dialog`}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-btn confirm ${type}`}
            onClick={onConfirm}
            aria-label={`${confirmText} action`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
