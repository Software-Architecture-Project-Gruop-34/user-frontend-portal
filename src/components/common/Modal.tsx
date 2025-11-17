import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  width?: string; // tailwind width class, e.g. "max-w-lg"
  className?: string;
  closeOnBackdrop?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  children,
  width = "max-w-lg",
  className = "",
  closeOnBackdrop = true,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isVisible) {
      // save focus and move focus to modal
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      setTimeout(() => wrapperRef.current?.focus(), 0);
      // prevent background scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
        previouslyFocused.current?.focus();
      };
    }
    return;
  }, [isVisible]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={wrapperRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`relative bg-white rounded-lg shadow-lg w-full ${width} ${className}`}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-2 rounded focus:outline-none"
        >
          <FaTimes />
        </button>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;