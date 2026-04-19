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
      className="otto-modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="otto-modal-content">
        <button type="button" className="otto-modal-close" onClick={onClose}>
          &times;
        </button>
        <img src={src} alt={alt} className="otto-modal-img" />
      </div>
    </dialog>
  );
}
