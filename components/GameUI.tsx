
import React from 'react';

export const Button: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, className = "", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-full font-bold text-white shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const Modal: React.FC<{
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText: string;
  icon?: string;
}> = ({ title, description, onConfirm, confirmText, icon }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-short">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      <Button onClick={onConfirm} className="bg-green-500 hover:bg-green-600 w-full">
        {confirmText}
      </Button>
    </div>
  </div>
);
