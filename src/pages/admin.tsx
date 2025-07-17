import React, { useEffect, useState } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import Navbar from '@/components/navbar';

interface RepairRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  deviceType: string;
  brand?: string;
  model?: string;
  problem: string;
  contactMethod?: string;
  repairTime?: string;
  remote?: boolean;
  createdAt?: any;
}

export default function AdminDashboard() {
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<RepairRequest | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const q = query(collection(db, 'repair_request'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setRepairRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RepairRequest)));
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const handleViewDetails = (req: RepairRequest) => setSelectedRequest(req);
  const handleCloseDetails = () => setSelectedRequest(null);

  const handleDeleteRequest = (req: RepairRequest) => {
    setRequestToDelete(req);
    setShowDeleteModal(true);
  };
  const confirmDeleteRequest = async () => {
    if (requestToDelete) {
      await deleteDoc(doc(db, 'repair_request', requestToDelete.id));
      setRepairRequests(repairRequests.filter(r => r.id !== requestToDelete.id));
      setShowDeleteModal(false);
      setRequestToDelete(null);
    }
  };
  const cancelDeleteRequest = () => {
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex flex-col">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-32 pb-16 px-4 w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold text-[#7c3aed] mb-8 text-center">NerdHerd Admin Dashboard</h1>
        <div className="w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Repair Requests</h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <div className="flex items-end gap-2 mt-8">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full bg-[#7c3aed]"
                    style={{
                      animation: `bounceDot 1s ${i * 0.15}s infinite cubic-bezier(.68,-0.55,.27,1.55)`
                    }}
                  />
                ))}
              </div>
              <style>{`
                @keyframes bounceDot {
                  0%, 100% { transform: translateY(0); opacity: 0.7; }
                  50% { transform: translateY(-18px); opacity: 1; }
                }
              `}</style>
            </div>
          ) : repairRequests.length === 0 ? (
            <div className="text-lg text-slate-500">No repair requests found.</div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl shadow-lg bg-white">
              <table className="w-full table-auto mb-8 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#ede9fe]">
                    <th className="px-6 py-4 text-left text-lg font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Device</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Problem</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Preferred Time</th>
                    <th className="px-6 py-4 text-center text-lg font-semibold">Remote</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Submitted At</th>
                    <th className="px-6 py-4 text-center text-lg font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {repairRequests.map(req => (
                    <tr key={req.id} className="border-b hover:bg-[#f3e8ff] transition">
                      <td className="px-6 py-4 whitespace-nowrap">{req.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{req.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                        {req.deviceType && (
                          <span className="inline-block w-6 h-6 rounded-full bg-[#ede9fe] flex items-center justify-center text-[#7c3aed] font-bold text-lg">
                            {req.deviceType[0]}
                          </span>
                        )}
                        <span>{req.deviceType} {req.brand} {req.model}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate" title={req.problem}>{req.problem}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{req.repairTime || <span className="text-slate-400">—</span>}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {req.remote ? <span className="inline-block px-2 py-1 rounded bg-[#7c3aed] text-white text-xs">Yes</span> : <span className="inline-block px-2 py-1 rounded bg-slate-200 text-slate-600 text-xs">No</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString() : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button onClick={() => handleViewDetails(req)} className="px-4 py-2 bg-[#7c3aed] text-white rounded hover:bg-[#6d28d9] mr-2 transition">View Details</button>
                        <button onClick={() => handleDeleteRequest(req)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-2xl text-[#7c3aed] hover:text-[#6d28d9]"
              onClick={handleCloseDetails}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#7c3aed] mb-4">Repair Request Details</h2>
            <div className="space-y-2">
              <div><span className="font-semibold">Name:</span> {selectedRequest.name}</div>
              <div><span className="font-semibold">Email:</span> {selectedRequest.email}</div>
              {selectedRequest.phone && <div><span className="font-semibold">Phone:</span> {selectedRequest.phone}</div>}
              <div><span className="font-semibold">Device:</span> {selectedRequest.deviceType} {selectedRequest.brand} {selectedRequest.model}</div>
              <div><span className="font-semibold">Problem:</span> {selectedRequest.problem}</div>
              <div><span className="font-semibold">Preferred Contact:</span> {selectedRequest.contactMethod || <span className="text-slate-400">—</span>}</div>
              <div><span className="font-semibold">Preferred Time:</span> {selectedRequest.repairTime || <span className="text-slate-400">—</span>}</div>
              <div><span className="font-semibold">Remote Assistance:</span> {selectedRequest.remote ? 'Yes' : 'No'}</div>
              <div><span className="font-semibold">Submitted At:</span> {selectedRequest.createdAt?.toDate ? selectedRequest.createdAt.toDate().toLocaleString() : <span className="text-slate-400">—</span>}</div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleCloseDetails} className="px-4 py-2 bg-[#7c3aed] text-white rounded hover:bg-[#6d28d9]">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Repair Request</h2>
            <p className="mb-6">Are you sure you want to delete the repair request for <span className="font-semibold">{requestToDelete?.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button onClick={cancelDeleteRequest} className="px-4 py-2 rounded bg-slate-200 text-slate-700">Cancel</button>
              <button onClick={confirmDeleteRequest} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 