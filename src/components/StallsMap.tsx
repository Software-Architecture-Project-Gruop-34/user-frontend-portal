import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReservationModal from "./Modals/ReservationModal";
import ReleaseModal from "./Modals/ReleaseModal";
import { Grid3x3, Map } from "lucide-react";

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

interface StallsMapProps {
  stalls: Stall[];
  onStallClick: (stallId: number) => void;
}

const StallsMap: React.FC<StallsMapProps> = ({ stalls, onStallClick }) => {
  const navigate = useNavigate();
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [stalledForModal, setStalledForModal] = useState<Stall | null>(null);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [stalledForRelease, setStalledForRelease] = useState<Stall | null>(null);

  // View mode toggle: "grid" or "map"
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Map view states
  const padding = 100;
  const maxX = Math.max(...stalls.map(s => s.x + s.width), 800) + padding;
  const maxY = Math.max(...stalls.map(s => s.y + s.depth), 600) + padding;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setZoom(z => Math.max(0.5, Math.min(3, z - e.deltaY * 0.001)));
  };

  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    isPanning.current = true;
    panStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning.current) {
      setOffset({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    }
  };

  const onMouseUp = () => {
    isPanning.current = false;
  };

  const sizeColors = {
    SMALL: "bg-blue-100 text-blue-700 border-blue-300",
    MEDIUM: "bg-amber-100 text-amber-700 border-amber-300",
    LARGE: "bg-purple-100 text-purple-700 border-purple-300",
  };

  const handleStallClick = (stall: Stall) => {
    setSelectedStall(stall);
    onStallClick(stall.id);
  };

  const openReservation = (stall: Stall) => {
    setStalledForModal(stall);
    setReservationModalOpen(true);
  };

  const closeReservation = () => {
    setReservationModalOpen(false);
    setStalledForModal(null);
  };

  const openRelease = (stall: Stall) => {
    setStalledForRelease(stall);
    setReleaseModalOpen(true);
  };

  const closeRelease = () => {
    setReleaseModalOpen(false);
    setStalledForRelease(null);
  };

  const handleConfirmReserve = async (stallId: number) => {
    if (selectedStall && selectedStall.id === stallId) {
      setSelectedStall({ ...selectedStall, status: "RESERVED" });
    }
  };

  const handleConfirmRelease = async (stallId: number) => {
    if (selectedStall && selectedStall.id === stallId) {
      setSelectedStall({ ...selectedStall, status: "AVAILABLE" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map/Grid Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Exhibition Hall Layout</h2>

                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                        viewMode === "grid"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("map")}
                      className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                        viewMode === "map"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Map className="w-4 h-4" />
                      Map
                    </button>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-200 border-2 border-gray-300" />
                      <span>Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-600" />
                      <span>Available</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {viewMode === "grid" ? "Click on any stall to view details" : "Drag to pan, scroll to zoom"}
              </p>
            </div>

            <div className="p-6">
              {viewMode === "grid" ? (
                // Grid View
                <div className="grid grid-cols-8 gap-2">
                  {stalls.map((stall) => {
                    const isAvailable = stall.status === "AVAILABLE";
                    const sizeClass =
                      sizeColors[stall.size.toUpperCase() as keyof typeof sizeColors] ||
                      sizeColors.SMALL;

                    return (
                      <button
                        key={stall.id}
                        onClick={() => handleStallClick(stall)}
                        className={`aspect-square rounded-lg border-2 p-2 text-xs font-medium transition-all cursor-pointer
                          ${isAvailable ? "bg-green-50 border-green-600 hover:bg-green-100" : "bg-gray-100 border-gray-300"}
                          ${selectedStall?.id === stall.id ? "ring-2 ring-blue-500 scale-105 shadow-lg" : ""}`}
                        type="button"
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="font-bold text-gray-900">{stall.stallCode}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 ${sizeClass}`}>
                            {stall.size[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Map View
                <div className="w-full bg-gray-50 rounded-lg overflow-hidden">
                  <svg
                    ref={svgRef}
                    className="w-full h-[600px] border border-gray-300 bg-white"
                    viewBox={`0 0 ${maxX} ${maxY}`}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    style={{
                      cursor: isPanning.current ? "grabbing" : "grab",
                    }}
                  >
                    {/* Background grid */}
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="0.6" />
                      </pattern>
                    </defs>

                    <g transform={`translate(${offset.x / zoom}, ${offset.y / zoom}) scale(${zoom})`}>
                      <rect width={maxX} height={maxY} fill="url(#grid)" />

                      {/* Map outline */}
                      <rect
                        x={20}
                        y={20}
                        width={maxX - 40}
                        height={maxY - 40}
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />

                      {/* Stalls */}
                      {stalls.map((stall) => {
                        const isAvailable = stall.status === "AVAILABLE";
                        const isSelected = selectedStall?.id === stall.id;

                        const colors = {
                          fill: isAvailable ? "#bbf7d0" : "#e5e7eb",
                          stroke: isSelected ? "#2563eb" : isAvailable ? "#059669" : "#9ca3af",
                        };

                        return (
                          <g
                            key={stall.id}
                            transform={`translate(${stall.x}, ${stall.y}) rotate(${stall.rotation}, ${stall.width / 2}, ${stall.depth / 2})`}
                            onClick={() => handleStallClick(stall)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <rect
                              width={stall.width}
                              height={stall.depth}
                              fill={colors.fill}
                              stroke={colors.stroke}
                              strokeWidth={isSelected ? "4" : "2.5"}
                              rx="5"
                            />

                            {/* Stall Code */}
                            <text
                              x={stall.width / 2}
                              y={stall.depth / 2 - 10}
                              textAnchor="middle"
                              fontSize="14"
                              fontWeight="bold"
                              fill="#1f2937"
                            >
                              {stall.stallCode}
                            </text>

                            {/* Category */}
                            <text
                              x={stall.width / 2}
                              y={stall.depth / 2 + 5}
                              textAnchor="middle"
                              fontSize="11"
                              fill="#4b5563"
                            >
                              {stall.category}
                            </text>

                            {/* Dimensions */}
                            <text
                              x={stall.width / 2}
                              y={stall.depth / 2 + 20}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#6b7280"
                            >
                              {stall.width}×{stall.depth}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stall Details Section */}
        <div>
          <div className="bg-white rounded-lg shadow sticky top-4">
            {selectedStall ? (
              <>
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">{selectedStall.stallCode}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedStall.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedStall.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{selectedStall.stallName}</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium">{selectedStall.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimensions</span>
                      <span className="font-medium">{selectedStall.width} × {selectedStall.depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price</span>
                      <span className="font-medium">Rs.{selectedStall.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Position</span>
                      <span className="font-medium">({selectedStall.x}, {selectedStall.y})</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    {selectedStall.status === "AVAILABLE" ? (
                      <>
                        <button
                          onClick={() => openReservation(selectedStall)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Reserve Stall
                        </button>

                        <button
                          onClick={() => navigate(`/stalls/${selectedStall.id}`)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          More details
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openRelease(selectedStall)}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Release Stall
                        </button>

                        <button
                          onClick={() => navigate(`/stalls/${selectedStall.id}`)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          More details
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-16 text-center">
                <svg
                  className="h-12 w-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">Select a stall from the {viewMode} to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reservation confirmation modal */}
      <ReservationModal
        isVisible={reservationModalOpen}
        stall={stalledForModal}
        onClose={closeReservation}
        onConfirm={handleConfirmReserve}
      />

      {/* Release confirmation modal */}
      <ReleaseModal
        isVisible={releaseModalOpen}
        stall={stalledForRelease}
        onClose={closeRelease}
        onConfirm={handleConfirmRelease}
      />
    </div>
  );
};

export default StallsMap;
