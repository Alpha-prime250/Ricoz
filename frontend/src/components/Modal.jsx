"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, footer, width = 520 }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="rz-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="rz-modal" role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth: width }}>
        <div className="rz-modal-head">
          <h3>{title}</h3>
          <button className="rz-icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="rz-modal-body">{children}</div>
        {footer && <div className="rz-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
