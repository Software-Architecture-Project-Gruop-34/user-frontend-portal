import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../components/common/Toast";
import EditStallModal from "../components/Modals/EditStallModal";
import DeleteStallModal from "../components/Modals/DeleteStallModal";
import { Edit2, Trash2 } from "lucide-react";

interface Stall {
  id: number;
  stallCode: string;
  stallName: string;
  size: string;
  width: number;
  depth: number;
  category: string;
  x: number;
  y: number;
  rotation: number;
  status: string;
  imgUrl?: string;
  price: number;
}

const StallProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stall, setStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const rawRole = localStorage.getItem("userRole") || "";
  const role = rawRole.toUpperCase();
  const isAdmin = role === "ADMIN";

  const baseUrl = "http://localhost:8081/api/stalls";

  useEffect(() => {
    if (!id) {
      setError("Invalid stall id");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchStall = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/${id}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load stall (${res.status})`);
        const data: Stall = await res.json();
        setStall(data);
        setError(null);
      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error(err);
          setError(err instanceof Error ? err.message : String(err) || "Failed to load stall");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStall();
    return () => controller.abort();
  }, [id]);

  const updateStatus = async (action: "reserve" | "release") => {
    if (!stall) return;
    setSaving(true);
    try {
      const res = await fetch(`${baseUrl}/${stall.id}/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Action failed (${res.status})`);
      const refreshedRes = await fetch(`${baseUrl}/${stall.id}`);
      if (refreshedRes.ok) {
        const updated: Stall = await refreshedRes.json();
        setStall(updated);
      }
      showSuccess(`${action === "reserve" ? "Reserved" : "Released"} successfully`);
    } catch (err: unknown) {
      console.error(err);
      showError(err instanceof Error ? err.message : String(err) || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (updated: Stall) => {
    setStall(updated);
    showSuccess("Stall updated");
  };

  const handleAfterDelete = () => {
    navigate("/stalls");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading stall...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!stall) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Stall not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-2 bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            

            <div>
              <h2 className="text-2xl font-semibold text-slate-800">{stall.stallName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{stall.stallCode}</span>
                <span
                  className={
                    "inline-flex items-center text-xs font-medium px-2 py-1 rounded-full " +
                    (stall.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700")
                  }
                >
                  {stall.status}
                </span>
                <span className="text-sm text-slate-600">• {stall.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <Link
                    to="/stalls"
                    className="px-4 py-2 bg-gray-100 text-slate-700 rounded-md shadow hover:bg-gray-200"
                  >
                    Back
                  </Link>
              
              
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 h-72 bg-gray-100 flex items-center justify-center">
              <img
                src={stall.imgUrl || ""}
                alt={stall.stallName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='28'%3ENo+image%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 mb-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Size</div>
                    <div className="text-base font-medium">{stall.size}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Dimensions</div>
                    <div className="text-base font-medium">
                      {stall.width} × {stall.depth} cm
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Position</div>
                    <div className="text-base font-medium">x: {stall.x}, y: {stall.y}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Rotation</div>
                    <div className="text-base font-medium">{stall.rotation}°</div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-600">
                  <p>
                    <span className="font-medium">Category:</span> {stall.category}
                  </p>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="text-lg font-semibold">Rs.{stall.price.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Stall
                    </button>

                    <button
                      onClick={() => setDeleteOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}

                <div className="flex-1 flex gap-3">
                  {stall.status === "AVAILABLE" ? (
                    <button
                      onClick={() => updateStatus("reserve")}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 disabled:opacity-60"
                    >
                      {saving ? "Processing..." : "Reserve Stall"}
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus("release")}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md shadow hover:bg-yellow-700 disabled:opacity-60"
                    >
                      {saving ? "Processing..." : "Release Stall"}
                    </button>
                  )}

                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* modals */}
        <EditStallModal isVisible={editOpen} stall={stall} onClose={() => setEditOpen(false)} onSave={handleSave} />
        <DeleteStallModal
          isVisible={deleteOpen}
          stall={stall}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => {
            setDeleteOpen(false);
            handleAfterDelete();
          }}
        />
      </div>
    </div>
  );
};

export default StallProfile;
