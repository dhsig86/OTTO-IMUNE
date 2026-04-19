"use client";

import { useEffect, useRef } from "react";

export default function ReferencePopup({
  src,
  alt,
  isOpen,
  onClose
}: {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="border-none rounded-xl p-0 max-w-[90vw] max-h-[90vh] shadow-[0_8px_40px_rgba(0,0,0,0.2)] overflow-hidden backdrop:bg-black/50"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="relative pt-8 pb-6 px-6 max-w-[600px] bg-otto-surface overflow-y-auto max-h-[85vh]">
        <button 
          type="button" 
          className="absolute top-3 right-3 bg-transparent border-none text-[1.5rem] leading-none text-otto-muted cursor-pointer px-2 py-1 rounded transition-colors hover:text-otto-text hover:bg-otto-bg" 
          onClick={onClose}
        >
          &times;
        </button>
        <img src={src} alt={alt} className="w-full h-auto block rounded-md" />
      </div>
    </dialog>
  );
}
