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
          onClick={onClose}
          className="absolute top-3 right-3 text-[1.4rem] leading-none text-otto-muted bg-transparent border-none cursor-pointer hover:text-otto-text transition-colors"
          aria-label="Fechar"
        >
          &times;
        </button>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg block mx-auto"
          />
        )}
        {alt && (
          <p className="text-center text-sm text-otto-muted mt-3 mb-0">{alt}</p>
        )}
      </div>
    </dialog>
  );
}
