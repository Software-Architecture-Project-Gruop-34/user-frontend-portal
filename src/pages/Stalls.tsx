import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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

const StallsPage: React.FC = () => {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchStalls = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8081/api/stalls", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data: Stall[] = await res.json();
        setStalls(data);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof DOMException) {
          if (err.name !== "AbortError") {
            console.error(err);
            setError(err.message || "Failed to load stalls");
          }
        } else {
          const message = err instanceof Error ? err.message : String(err);
          console.error(err);
          setError(message || "Failed to load stalls");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStalls();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading stalls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!stalls.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No stalls available.</p>
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">All Stalls</h1>
          <Link
            to="/stalls/new"
            className="text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Stall
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {stalls.map((stall) => (
            <article
              key={stall.id}
              onClick={() => navigate(`/stalls/${stall.id}`)}
              className="bg-white rounded-lg shadow overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
              role="button"
              aria-label={`Open ${stall.stallName} profile`}
            >
              <div className="h-40 w-full bg-gray-200">
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

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-medium">{stall.stallName}</h2>
                    <p className="text-sm text-gray-500">
                      {stall.stallCode} • {stall.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-semibold">{stall.size}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={
                      "text-sm font-medium px-2 py-1 rounded " +
                      (stall.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700")
                    }
                  >
                    {stall.status}
                  </span>

                  <span className="text-lg font-semibold">
                    ₹{stall.price.toFixed(2)}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  {/* prevent parent navigation when clicking these controls */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/stalls/${stall.id}`);
                    }}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Reserve ${stall.stallName} (${stall.stallCode})`);
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StallsPage;