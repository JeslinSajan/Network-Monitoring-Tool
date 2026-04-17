import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-panel rounded-lg p-6 max-w-md mx-4 border-t border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 font-mono">{title}</h3>
        <p className="text-neutral-300 mb-6 text-sm font-mono">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-neon-crimson/20 border border-neon-crimson text-neon-crimson px-4 py-2 rounded text-sm font-mono hover:bg-neon-crimson/30 transition-all"
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-neutral-800/50 border border-neutral-600 text-neutral-400 px-4 py-2 rounded text-sm font-mono hover:bg-neutral-800/70 transition-all"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
