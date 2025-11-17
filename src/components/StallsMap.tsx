import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReservationModal from "./Modals/ReservationModal";

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

  // optional: update UI locally after confirm
  const handleConfirmReserve = async (stallId: number) => {
    if (selectedStall && selectedStall.id === stallId) {
      setSelectedStall({ ...selectedStall, status: "RESERVED" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Exhibition Hall Layout</h2>
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
              <p className="text-sm text-gray-500">Click on any stall to view details</p>
            </div>

            <div className="p-6">
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
                          onClick={() => alert(`Release stall ${selectedStall.stallCode}`)}
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
                <p className="text-gray-500">Select a stall from the map to view details</p>
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
    </div>
  );
};

export default StallsMap;
