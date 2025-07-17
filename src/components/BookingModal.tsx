import React, { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const deviceTypes = ['Laptop', 'Desktop', 'Phone', 'Tablet', 'Other'];
const contactMethods = ['Email', 'Phone', 'Either'];

const initialState = {
  name: '',
  email: '',
  phone: '',
  deviceType: '',
  brand: '',
  model: '',
  problem: '',
  contactMethod: 'Either',
  repairTime: '',
  remote: false,
};

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
      setForm(initialState);
      setSuccess(false);
      setError('');
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.deviceType.trim() || !form.problem.trim()) {
      setError('Please fill in all required fields.');
      return false;
    }
    // Simple email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'repair_request'), {
        ...form,
        createdAt: Timestamp.now(),
      });
      setSuccess(true);
      setForm(initialState);
      localStorage.setItem('repairBookingForm', JSON.stringify(form));
    } catch (err) {
      setError('There was a problem submitting your request. Please try again.');
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative animate-fadeIn mx-4">
        <button
          className="absolute top-4 right-4 text-2xl text-purple-400 hover:text-purple-700"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {success ? (
          <div className="text-center space-y-4">
            <div className="text-3xl">🎉</div>
            <div className="text-xl font-bold text-purple-700">Thank you!</div>
            <div>Your repair request has been received. A NerdHerd tech will contact you soon to confirm your repair.</div>
            <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl font-bold" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="text-2xl font-bold text-purple-700 mb-2">Book a Repair</div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <div className="flex gap-2">
              <input name="name" value={form.name} onChange={handleChange} className="flex-1 p-3 rounded-xl border border-purple-200" placeholder="Name*" required />
              <input name="email" value={form.email} onChange={handleChange} className="flex-1 p-3 rounded-xl border border-purple-200" placeholder="Email*" required type="email" />
            </div>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-3 rounded-xl border border-purple-200" placeholder="Phone (optional)" />
            <div className="grid grid-cols-3 gap-2">
              <select name="deviceType" value={form.deviceType} onChange={handleChange} className="p-3 rounded-xl border border-purple-200" required>
                <option value="">Device Type*</option>
                {deviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <input name="brand" value={form.brand} onChange={handleChange} className="p-3 rounded-xl border border-purple-200" placeholder="Brand" />
              <input name="model" value={form.model} onChange={handleChange} className="p-3 rounded-xl border border-purple-200" placeholder="Model" />
            </div>
            <textarea name="problem" value={form.problem} onChange={handleChange} className="w-full p-3 rounded-xl border border-purple-200" placeholder="Describe the problem*" rows={3} required />
            <div className="flex gap-2">
              <select name="contactMethod" value={form.contactMethod} onChange={handleChange} className="flex-1 p-3 rounded-xl border border-purple-200">
                {contactMethods.map(method => <option key={method} value={method}>{method}</option>)}
              </select>
              <input name="repairTime" value={form.repairTime} onChange={handleChange} className="flex-1 p-3 rounded-xl border border-purple-200" placeholder="Preferred Time (optional)" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="remote" checked={form.remote} onChange={handleChange} />
              I’d like remote assistance if possible
            </label>
            <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg" disabled={loading}>{loading ? 'Booking...' : 'Book Repair'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal; 