import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
      // optimistic refresh
      const refreshedRes = await fetch(`${baseUrl}/${stall.id}`);
      if (refreshedRes.ok) {
        const updated: Stall = await refreshedRes.json();
        setStall(updated);
      }
      toast.success(`${action === "reserve" ? "Reserved" : "Released"} successfully`);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : String(err) || "Operation failed");
    } finally {
      setSaving(false);
    }
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
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
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
    <div className="h-full p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 h-64 bg-gray-200">
            <img
              src={stall.imgUrl}
              alt={stall.stallName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23e5e7eb' width='600' height='400'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24'%3ENo+image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          <div className="md:w-1/2 p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{stall.stallName}</h1>
                <p className="text-sm text-gray-500">
                  {stall.stallCode} • {stall.category}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-xl font-semibold">Rs.{stall.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div>
                <p className="font-medium">Size</p>
                <p>{stall.size}</p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <p>
                  <span
                    className={
                      "inline-block px-2 py-1 rounded text-sm " +
                      (stall.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700")
                    }
                  >
                    {stall.status}
                  </span>
                </p>
              </div>

              <div>
                <p className="font-medium">Dimensions</p>
                <p>
                  {stall.width}cm × {stall.depth}cm
                </p>
              </div>

              <div>
                <p className="font-medium">Position / Rotation</p>
                <p>
                  x: {stall.x}, y: {stall.y}, rot: {stall.rotation}°
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {stall.status === "AVAILABLE" ? (
                <button
                  onClick={() => updateStatus("reserve")}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                >
                  {saving ? "Processing..." : "Reserve Stall"}
                </button>
              ) : (
                <button
                  onClick={() => updateStatus("release")}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-60"
                >
                  {saving ? "Processing..." : "Release Stall"}
                </button>
              )}

              <Link
                to="/stalls"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Back to list
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StallProfile;
