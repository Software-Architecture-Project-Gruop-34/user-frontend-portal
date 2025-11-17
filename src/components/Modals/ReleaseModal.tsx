import React, { useState } from "react";
import Modal from "../common/Modal";
import { showSuccess, showError } from "../common/Toast";

interface Stall {
  id: number;
  stallCode?: string;
  stallName?: string;
  width?: number;
  depth?: number;
  category?: string;
  price?: number;
  status?: string;
}

interface ReleaseModalProps {
  isVisible: boolean;
  stall: Stall | null;
  onClose: () => void;
  onConfirm?: (stallId: number) => Promise<void> | void;
}

const BASE = "http://localhost:8081";

const ReleaseModal: React.FC<ReleaseModalProps> = ({ isVisible, stall, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stall) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/stalls/${stall.id}/release`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stallId: stall.id }),
      });

      if (!res.ok) {
        let msg = `Release failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {
          const txt = await res.text().catch(() => "");
          if (txt) msg = txt;
        }
        throw new Error(msg);
      }

      showSuccess(`Stall ${stall.stallCode ?? stall.id} released`);
      if (onConfirm) await onConfirm(stall.id);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      let msg = "Release failed";
      if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
        msg = (err as { message: string }).message;
      } else if (typeof err === "string") {
        msg = err;
      } else {
        try {
          msg = String(err);
        } catch {
          msg = "Release failed";
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
        <h3 className="text-lg font-semibold mb-2">Confirm Release</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to release{" "}
          <span className="font-medium">{stall?.stallCode ?? "this stall"}</span>
          {stall?.stallName ? ` — ${stall.stallName}` : ""}?
        </p>

        {stall && (
          <div className="text-sm text-gray-700 mb-4 space-y-1">
            <div>
              <span className="text-gray-500">Category:</span> <span className="font-medium">{stall.category}</span>
            </div>
            <div>
              <span className="text-gray-500">Dimensions:</span>{" "}
              <span className="font-medium">{stall.width} × {stall.depth}</span>
            </div>
            <div>
              <span className="text-gray-500">Price:</span> <span className="font-medium">₹{stall.price?.toFixed?.(2)}</span>
            </div>
          </div>
        )}

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
            {loading ? "Processing..." : "Confirm Release"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReleaseModal;