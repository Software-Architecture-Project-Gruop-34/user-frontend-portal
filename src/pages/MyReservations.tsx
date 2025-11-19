import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/common/Table";
import type { Column } from "../components/common/Table";
import { showSuccess, showError } from "../components/common/Toast";

type Reservation = {
  id: number;
  userId: number;
  stallId: number;
  reservationDate: string | null;
  confirmationDate: string | null;
  status: string;
  qrCode?: string | null;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  filterable?: false;
};

const RESERVATION_BASE = "http://localhost:8082";

const MyReservations: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userIdRaw = localStorage.getItem("userId");
  const userId = userIdRaw ? Number(userIdRaw) : null;

  useEffect(() => {
    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${RESERVATION_BASE}/api/reservations/user/${userId}`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const data: Reservation[] = await res.json();
        setReservations(Array.isArray(data) ? data : [data]);
        setError(null);
      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg || "Failed to load reservations");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
    return () => controller.abort();
  }, [userId]);

  const cancelReservation = async (reservation: Reservation) => {
    if (!reservation?.id) return;
    const ok = window.confirm("Cancel this reservation?");
    if (!ok) return;
    try {
      const res = await fetch(
        `${RESERVATION_BASE}/api/reservations/${reservation.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) {
        let msg = `Cancel failed (${res.status})`;
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {
            // ignore JSON parse errors
        }
        throw new Error(msg);
      }
      setReservations((prev) => prev.filter((r) => r.id !== reservation.id));
      showSuccess("Reservation cancelled");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showError(msg || "Cancel failed");
    }
  };

  const cols: Column<Reservation>[] = [
    { key: "id", header: "ID", width: 60 },
    {
      key: "stallId",
      header: "Stall",
      render: (_v, row) => (
        <button
          className="text-blue-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/stalls/${row.stallId}`);
          }}
        >
          {row.stallId}
        </button>
      ),
    },
    {
      key: "reservationDate",
      header: "Reserved On",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
    {
      key: "confirmationDate",
      header: "Confirmed On",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
    { key: "status", header: "Status" },
    {
      key: "totalAmount",
      header: "Amount",
      render: (v) => (typeof v === "number" ? `Rs.${v.toFixed(2)}` : "-"),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_v, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stalls/${row.stallId}`);
            }}
            className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
          >
            View Stall
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              cancelReservation(row);
            }}
            className="px-2 py-1 text-sm bg-red-600 text-white rounded"
            disabled={row.status === "CANCELLED"}
          >
            Cancel
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-3">My Reservations</h2>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">My Reservations</h2>

      <Table
        columns={cols}
        data={reservations}
        loading={loading}
        pagination
        pageSize={10}
        searchable
        sortable
        filterable={false} // disable column header search inputs
        emptyMessage="No reservations found"
      />
    </div>
  );
};

export default MyReservations;
