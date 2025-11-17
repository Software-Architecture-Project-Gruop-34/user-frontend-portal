import React, { useState } from "react";
import Modal from "../common/Modal";
import { showSuccess, showError } from "../common/Toast";

interface Stall {
  id: number;
  stallCode?: string;
  stallName?: string;
  size?: string;
  width?: number;
  depth?: number;
  category?: string;
  x?: number;
  y?: number;
  rotation?: number;
  status?: string;
  imgUrl?: string;
  price?: number;
}

interface ReservationModalProps {
  isVisible: boolean;
  stall: Stall | null;
  onClose: () => void;
  onConfirm?: (stallId: number) => Promise<void> | void; // callback for parent after successful reservation
}

const BASE = "http://localhost:8081";

const ReservationModal: React.FC<ReservationModalProps> = ({ isVisible, stall, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stall) return;
    setError(null);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      const msg = "You must be logged in to reserve a stall.";
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    try {
      // call backend reserve endpoint with userId and stallId
      const res = await fetch(`${BASE}/api/stalls/${stall.id}/reserve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({ userId, stallId: stall.id }),
      });

      if (!res.ok) {
        // try parse JSON error body (expected format)
        let msg = `Reservation failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {
          const txt = await res.text().catch(() => "");
          if (txt) msg = txt;
        }
        throw new Error(msg);
      }

      // success
      showSuccess(`Stall ${stall.stallCode ?? stall.id} reserved`);
      if (onConfirm) {
        await onConfirm(stall.id);
      }
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error ? err.message : (typeof err === "string" ? err : "Reservation failed");
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} width="max-w-md" closeOnBackdrop>
      <div>
        <h3 className="text-lg font-semibold mb-2">Confirm Reservation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to reserve{" "}
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
              <span className="text-gray-500">Price:</span> <span className="font-medium">Rs.{stall.price?.toFixed(2)}</span>
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
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Reservation"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReservationModal;