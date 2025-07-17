import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import { db } from '@/config/firebase';
import { collection, addDoc } from 'firebase/firestore';

const steps = [
  {
    label: 'Your Info',
    question: "What's your name?",
    name: 'name',
    type: 'text',
    placeholder: 'Enter your name',
    required: true,
  },
  {
    label: 'Your Info',
    question: "What's your email?",
    name: 'email',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
  },
  {
    label: 'Device Info',
    question: "What type of device needs help?",
    name: 'deviceType',
    type: 'select',
    options: ['Laptop', 'Desktop', 'Gaming PC', 'Tablet', 'Phone', 'Other'],
    placeholder: '',
    required: true,
  },
  {
    label: 'Device Info',
    question: "What's the brand?",
    name: 'brand',
    type: 'text',
    placeholder: 'e.g. Dell, Apple',
    required: true,
  },
  {
    label: 'Device Info',
    question: "What's the model?",
    name: 'model',
    type: 'text',
    placeholder: 'e.g. XPS 13',
    required: true,
  },
  {
    label: 'Problem',
    question: "Describe the problem in a few words.",
    name: 'problem',
    type: 'textarea',
    placeholder: 'Tell us what happened...',
    required: true,
  },
];

export default function DiagnosisForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => {
    const booking = localStorage.getItem('repairBookingForm');
    if (booking) {
      const parsed = JSON.parse(booking);
      return {
        name: parsed.name || '',
        email: parsed.email || '',
        deviceType: parsed.deviceType || '',
        brand: parsed.brand || '',
        model: parsed.model || '',
        problem: parsed.problem || '',
      };
    }
    return {
      name: '',
      email: '',
      deviceType: '',
      brand: '',
      model: '',
      problem: '',
    };
  });
  const navigate = useNavigate();

  const current = steps[step];

  // Autofocus logic
  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);
  React.useEffect(() => {
    if (current.type === 'select' && selectRef.current) selectRef.current.focus();
    else if (current.type === 'textarea' && textareaRef.current) textareaRef.current.focus();
    else if (inputRef.current) inputRef.current.focus();
  }, [step, current.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const next = async () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      // Save user info to Firestore
      try {
        const docRef = await addDoc(collection(db, 'users'), form);
        localStorage.setItem('userId', docRef.id);
      } catch (err) {
        // Optionally handle error
      }
      localStorage.setItem('diagnosisForm', JSON.stringify(form));
      navigate('/chatbot');
    }
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    try {
      console.log('Submitting form to Firestore:', form);
      const docRef = await addDoc(collection(db, 'users'), form);
      localStorage.setItem('userId', docRef.id);
      localStorage.setItem('diagnosisForm', JSON.stringify(form));
      navigate('/chatbot');
    } catch (err) {
      console.error('Firestore error:', err);
      // Try a minimal test write
      try {
        await addDoc(collection(db, 'users'), { test: 'hello' });
        alert('Minimal test write succeeded, but your form data failed. Check the form fields for invalid values.');
      } catch (testErr) {
        console.error('Minimal test write also failed:', testErr);
        alert('There was an error saving your info. Please check the console for details.');
      }
    }
  };

  // For bounce-in animation
  const motionVariants = {
    initial: { y: -40, opacity: 0, scale: 0.95 },
    animate: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.5, duration: 0.7 } },
    exit: { y: 40, opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <form
          onSubmit={e => { e.preventDefault(); next(); }}
          className="w-full max-w-xl mx-auto px-4 pt-24 pb-32 flex flex-col items-center"
        >
          <motion.div
            key={step}
            variants={motionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <div className="text-3xl md:text-5xl font-extrabold text-center mb-10 text-[#a21caf] drop-shadow-sm">
              {current.question}
            </div>
            {current.type === 'select' ? (
              <select
                ref={selectRef}
                name={current.name}
                value={form[current.name as keyof typeof form]}
                onChange={handleChange}
                required={current.required}
                className="w-full p-4 rounded-xl border-2 border-purple-200 text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition mb-2"
              >
                <option value="">Select...</option>
                {current.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : current.type === 'textarea' ? (
              <textarea
                ref={textareaRef}
                name={current.name}
                value={form[current.name as keyof typeof form]}
                onChange={handleChange}
                required={current.required}
                rows={4}
                placeholder={current.placeholder}
                className="w-full p-4 rounded-xl border-2 border-purple-200 text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition mb-2"
              />
            ) : (
              <input
                ref={inputRef}
                name={current.name}
                value={form[current.name as keyof typeof form]}
                onChange={handleChange}
                required={current.required}
                type={current.type}
                placeholder={current.placeholder}
                className="w-full p-4 rounded-xl border-2 border-purple-200 text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition mb-2"
              />
            )}
          </motion.div>
        </form>
        {/* Navigation Buttons fixed at bottom corners */}
        <div className="fixed bottom-0 left-0 w-full flex justify-between items-center px-8 pb-8 pointer-events-none z-40">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="px-8 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold text-lg shadow pointer-events-auto disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={step === steps.length - 1 ? handleSubmit : next}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow pointer-events-auto"
          >
            {step === steps.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 