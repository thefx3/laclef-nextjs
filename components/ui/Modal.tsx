"use client";

import type { ReactNode } from "react";

export default function Modal({ children, onClose,}: { children: ReactNode; onClose: () => void; }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
        >
          ✕
        </button>
      </div>
    </div>
  );
}