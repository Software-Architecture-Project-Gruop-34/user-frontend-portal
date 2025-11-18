import React, { useState } from "react";
import Modal from "../common/Modal";
import { showSuccess, showError } from "../common/Toast";

interface Stall {
  id: number;
  stallCode?: string;
  stallName?: string;
}

interface DeleteStallModalProps {
  isVisible: boolean;
  stall: Stall | null;
  onClose: () => void;
  onConfirm?: (stallId: number) => Promise<void> | void;
}

const BASE = "http://localhost:8081";

const DeleteStallModal: React.FC<DeleteStallModalProps> = ({ isVisible, stall, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stall) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/stalls/${stall.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 204 || res.ok) {
        showSuccess(`Stall ${stall.stallCode ?? stall.id} deleted`);
        if (onConfirm) await onConfirm(stall.id);
        onClose();
        return;
      }

      // try parse error message
      let msg = `Delete failed (${res.status})`;
      try {
        const j = await res.json();
        if (j?.message) msg = j.message;
      } catch {
        const txt = await res.text().catch(() => "");
        if (txt) msg = txt;
      }
      throw new Error(msg);
    } catch (err: unknown) {
      console.error(err);
      let msg = "Delete failed";
      if (err instanceof Error) {
        msg = err.message || msg;
      } else if (typeof err === "string" && err) {
        msg = err;
      } else {
        try {
          msg = String(err) || msg;
        } catch {
          // ignore conversion errors
        }
      }
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-md" closeOnBackdrop>
      <div>
        <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to permanently delete{" "}
          <span className="font-medium">{stall?.stallCode ?? "this stall"}</span>
          {stall?.stallName ? ` — ${stall.stallName}` : ""}?
        </p>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Stall"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteStallModal;