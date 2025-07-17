import React, { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Card, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { motion, useInView } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import BookingModal from '@/components/BookingModal';
import { db } from '@/config/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

export default function IndexPage() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [showBgLogo, setShowBgLogo] = useState(false);
  const navigate = useNavigate();
  const [pieProgress, setPieProgress] = useState(0);
  const [count, setCount] = useState(0);
  // Booking modal state
  const [modalOpen, setModalOpen] = useState(false);
  // Scream for Help form state
  const initialSosState = {
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
  const [sosForm, setSosForm] = useState(initialSosState);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);
  const [sosError, setSosError] = useState('');

  const handleSosChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setSosForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSosSubmit = async (e: any) => {
    e.preventDefault();
    setSosError('');
    if (!sosForm.name.trim() || !sosForm.email.trim() || !sosForm.deviceType.trim() || !sosForm.problem.trim()) {
      setSosError('Please fill in all required fields.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sosForm.email)) {
      setSosError('Please enter a valid email address.');
      return;
    }
    setSosLoading(true);
    try {
      await addDoc(collection(db, 'repair_request'), {
        ...sosForm,
        createdAt: Timestamp.now(),
      });
      setSosSuccess(true);
      setSosForm(initialSosState);
    } catch (err) {
      setSosError('There was a problem submitting your request. Please try again.');
    }
    setSosLoading(false);
  };

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        // Fade in when the hero is fully out of view
        setShowBgLogo(rect.bottom <= 0);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const services = [
    { title: "Virus & Malware Removal", icon: "🦠", description: "Kick those digital pests to the curb" },
    { title: "Slow Computer Tune-Ups", icon: "🐢", description: "Speed up your PC like it's on Red Bull" },
    { title: "Hardware Repair & Upgrades", icon: "🔧", description: "Fix it, upgrade it, make it awesome" },
    { title: "Laptop Screen/Keyboard Replacement", icon: "💻", description: "New parts, new life" },
    { title: "Custom Builds & Gaming Rig Optimization", icon: "🎮", description: "Build the ultimate gaming machine" },
    { title: "Home Networking Help", icon: "📡", description: "Get your WiFi working properly" },
    { title: "Remote Assistance", icon: "🖥️", description: "We can fix it from anywhere" },
  ];

  const whyChooseUs = [
    { title: "Techs Who Speak Human", icon: "/virusandmalware-Photoroom.svg", alt: "Techs Who Speak Human", description: "No tech jargon, just solutions" },
    { title: "Fast Turnaround Times", icon: "/slowcomputertuneup-Photoroom.svg", alt: "Fast Turnaround Times", description: "Quick fixes, happy customers" },
    { title: "No Surprise Fees", icon: "/homenetworkhelp-Photoroom.svg", alt: "No Surprise Fees", description: "What you see is what you pay" },
    { title: "Gamer-Friendly Fixes", icon: "/gamingbuilds-Photoroom.svg", alt: "Gamer-Friendly Fixes", description: "We speak gamer language" },
    { title: "We Actually Fix Stuff", icon: "/hardwareupgrades-Photoroom.svg", alt: "We Actually Fix Stuff", description: "No unnecessary upgrades" },
  ];

  const testimonials = [
    { name: "Sarah M.", rating: 5, text: "Fixed my laptop in under an hour. These guys are wizards!", avatar: "👩‍💻" },
    { name: "Mike R.", rating: 5, text: "Finally, tech support that doesn't make me feel stupid!", avatar: "👨‍💻" },
    { name: "Emma L.", rating: 5, text: "Recovered all my photos after I accidentally deleted them. Lifesavers!", avatar: "👩‍🎨" },
  ];

  // Floating Dots
  const dotColors = [
    "bg-purple-400",
    "bg-pink-400",
    "bg-cyan-400",
    "bg-blue-400",
    "bg-yellow-400",
    "bg-green-400",
    "bg-red-400",
    "bg-indigo-400",
  ];
  // Update dotAnims to only allow 'animate-bounce' or '' (static)
  const dotAnims = ["animate-bounce", ""];
  const floatingDots = Array.from({ length: 12 }).map((_, i) => {
    const size = Math.floor(Math.random() * 8) + 3; // 3-10
    const top = Math.random() * 95; // vh
    // Only allow dots in the left 0-15vw or right 85-100vw
    const left = Math.random() < 0.5
      ? Math.random() * 15 // 0-15vw
      : 85 + Math.random() * 15; // 85-100vw
    const color = dotColors[Math.floor(Math.random() * dotColors.length)];
    const anim = dotAnims[Math.floor(Math.random() * dotAnims.length)];
    return (
      <div
        key={i}
        className={`${color} ${anim} rounded-full absolute pointer-events-none`}
        style={{
          width: `${size * 4}px`,
          height: `${size * 4}px`,
          top: `${top}vh`,
          left: `${left}vw`,
          opacity: 0.7,
          zIndex: -1,
        }}
      />
    );
  });

  // Pie chart data
  const repairStats = [
    { name: 'Repaired', value: 1048, color: '#7c3aed' },
    { name: 'In Progress', value: 32, color: '#2563eb' },
    { name: 'Unrepairable', value: 120, color: '#e5e7eb' },
  ];

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-transparent">
        {/* Blurred background logo only appears after scrolling past hero, with fade-in animation */}
        <img
          src="/NerdHerdNewLogo.svg"
          alt="NerdHerd Logo Background"
          className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none select-none blur-lg w-[60vw] max-w-5xl transition-opacity duration-700 ${showBgLogo ? 'opacity-70' : 'opacity-0'}`}
          style={{
            filter:
              "brightness(0) saturate(100%) invert(48%) sepia(97%) saturate(749%) hue-rotate(222deg) brightness(101%) contrast(101%) blur(16px)",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 w-full h-full pointer-events-none -z-10">
          {floatingDots}
        </div>
        {/* Hero Section */}
        <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-md opacity-50 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-md opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-md opacity-50 animate-blob animation-delay-4000"></div>
            {/* Gradient overlay for seamless transition */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
          </div>
          
          {/* Main Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 tracking-tight">
              Don't <span className="text-[#7c3aed]">Rage Quit</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-4">
              We <span className="text-[#7c3aed]">Revive</span> the Tech!
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
              Fast, friendly, and sarcastically smart computer repair.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={() => setModalOpen(true)}
              >
                Book a Repair
              </button>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={() => navigate('/diagnosis')}
              >
                Get a Free Diagnosis
              </button>
            </div>
          </div>
        </section>

        {/* Services Section - Bento Grid */}
        <section id="services" className="py-20 px-6 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-slate-800 text-center mb-16">
              What We Fix
          <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-2xl md:text-3xl font-semibold block mt-2">aka All the Stuff You Broke</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(120px,1fr)]">
              {/* Large featured card */}
              {(() => {
                const ref = React.useRef(null);
                const inView = useInView(ref, { amount: 0.1 });
                return (
                  <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.6 }}
                    className="relative col-span-1 md:col-span-2 row-span-2 rounded-3xl bg-gradient-to-br from-purple-500/90 to-pink-400/80 shadow-xl flex flex-col justify-end p-8 overflow-hidden"
                  >
                    {/* Background gaming PC image */}
                    <img
                      src="/gamingpc.jpg"
                      alt="Gaming PC"
                      className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 blur-sm scale-105"
                      style={{ filter: 'brightness(0.6) blur(4px)' }}
                      aria-hidden="true"
                    />
                    {/* Gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-pink-400/80 z-10" />
                    <div className="relative z-20">
                      <div className="absolute top-4 right-4 text-5xl opacity-20">🎮</div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 z-10">Custom Builds & Gaming Rig Optimization</h3>
                      <p className="text-white/90 z-10">Build the ultimate gaming machine</p>
                    </div>
                  </motion.div>
                );
              })()}
              {/* Other service cards with updated SVG icons */}
              {[
                {
                  icon: "/virusandmalware-Photoroom.svg",
                  alt: "Virus & Malware Removal",
                  title: "Virus & Malware Removal",
                  desc: "Kick those digital pests to the curb",
                },
                {
                  icon: "/slowcomputertuneup-Photoroom.svg",
                  alt: "Slow Computer Tune-Ups",
                  title: "Slow Computer Tune-Ups",
                  desc: "Speed up your PC like it's on Red Bull",
                },
                {
                  icon: "/hardwareupgrades-Photoroom.svg",
                  alt: "Hardware Repair & Upgrades",
                  title: "Hardware Repair & Upgrades",
                  desc: "Fix it, upgrade it, make it awesome",
                },
                {
                  icon: "/homenetworkhelp-Photoroom.svg",
                  alt: "Home Networking Help",
                  title: "Home Networking Help",
                  desc: "Get your WiFi working properly",
                },
              ].map((card, i) => {
                const ref = React.useRef(null);
                const inView = useInView(ref, { amount: 0.1 });
                return (
                  <motion.div
                    key={card.title}
                    ref={ref}
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.6, delay: 0.1 * (i + 1) }}
                    className="rounded-3xl bg-white/50 backdrop-blur-md shadow-lg p-6 flex flex-col justify-between border border-purple-100"
                  >
                    <div className="bg-white/50 backdrop-blur-md p-2 rounded-full w-fit mb-2">
                      <img src={card.icon} alt={card.alt} className="w-12 h-12" style={{ filter: 'invert(32%) sepia(97%) saturate(749%) hue-rotate(222deg) brightness(101%) contrast(101%)' }} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{card.title}</h3>
                    <p className="text-slate-600">{card.desc}</p>
                  </motion.div>
                );
              })}
              {/* Remote Assistance card spanning the bottom */}
              {(() => {
                const ref = React.useRef(null);
                const inView = useInView(ref, { amount: 0.1 });
                return (
                  <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="rounded-3xl bg-white/50 backdrop-blur-md p-6 flex flex-col justify-between border border-purple-100 col-span-full"
                  >
                    <div className="bg-white/50 backdrop-blur-md p-2 rounded-full w-fit mb-2">
                      <img src="/remoteassistance-Photoroom.svg" alt="Remote Assistance" className="w-12 h-12" style={{ filter: 'invert(32%) sepia(97%) saturate(749%) hue-rotate(222deg) brightness(101%) contrast(101%)' }} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Remote Assistance</h3>
                    <p className="text-slate-600">We can help you from anywhere</p>
                  </motion.div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-20 px-6 bg-white/50">
          <div className="max-w-4xl mx-auto rounded-3xl p-0 flex flex-col md:flex-row items-center gap-8 border border-purple-100" style={{ background: '#7c3aed' }}>
            {/* Illustration or photo placeholder */}
            <div className="flex-shrink-0 mb-6 md:mb-0 p-10">
              <img src="/NerdHerdNewLogo.svg" alt="NerdHerd Team" className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-2xl" style={{ filter: 'invert(1)' }} />
            </div>
            <div className="p-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                About <span className="text-black font-extrabold">Nerd</span><span className="text-white font-extrabold">Herd</span>
              </h2>
              <p className="text-lg text-white mb-2">
                We’re a team of tech wizards, gamers, and hardware nerds who love solving problems and reviving dead devices. From virus infestations to WiFi woes, we’ve seen (and fixed) it all. Our mission? Make tech less scary, more fun, and always reliable—without the geek-speak or hidden fees.
              </p>
              <p className="text-md text-white/90">
                Whether you’re a hardcore gamer, a remote worker, or just someone who wants their laptop to stop making weird noises, we’ve got your back. Proudly serving our community with a smile, a screwdriver, and a little bit of magic.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="why-us" className="py-32 px-6 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-slate-800 text-center mb-16">
              Why Us? <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Because We're Awesome.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Top row: first three cards with slide-in animation */}
              {whyChooseUs.slice(0, 3).map((item, index) => {
                const ref = React.useRef(null);
                const inView = useInView(ref, { amount: 0.2 });
                // Slide directions: 0=left, 1=up, 2=right
                const slideVariants = [
                  { x: -60, opacity: 0 }, // left
                  { y: -60, opacity: 0 }, // up
                  { x: 60, opacity: 0 },  // right
                ];
                return (
                  <motion.div
                    key={index}
                    ref={ref}
                    initial={slideVariants[index]}
                    animate={inView ? { x: 0, y: 0, opacity: 1 } : slideVariants[index]}
                    transition={{ duration: 0.7, delay: 0.1 * index }}
                    className="text-center group"
                  >
                    <div className="bg-white/50 backdrop-blur-md p-2 rounded-full w-fit mb-4 mx-auto">
                      <img src={item.icon} alt={item.alt} className="w-12 h-12" style={{ filter: 'invert(32%) sepia(97%) saturate(749%) hue-rotate(222deg) brightness(101%) contrast(101%)' }} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
            {/* Bottom row: last two cards centered with slide-in animation */}
            <div className="flex flex-col lg:flex-row justify-center items-center gap-8 mt-8">
              {whyChooseUs.slice(3).map((item, index) => {
                const ref = React.useRef(null);
                const inView = useInView(ref, { amount: 0.2 });
                // Slide directions: 0=left, 1=right
                const slideVariants = [
                  { x: -60, opacity: 0 }, // left
                  { x: 60, opacity: 0 },  // right
                ];
                return (
                  <motion.div
                    key={index + 3}
                    ref={ref}
                    initial={slideVariants[index]}
                    animate={inView ? { x: 0, opacity: 1 } : slideVariants[index]}
                    transition={{ duration: 0.7, delay: 0.25 + 0.1 * index }}
                    className="text-center group"
                  >
                    <div className="bg-white/50 backdrop-blur-md p-2 rounded-full w-fit mb-4 mx-auto">
                      <img src={item.icon} alt={item.alt} className="w-12 h-12" style={{ filter: 'invert(32%) sepia(97%) saturate(749%) hue-rotate(222deg) brightness(101%) contrast(101%)' }} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Guarantee and Stats Section - Aligned and Informative */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Guarantee Card */}
            {(() => {
              const ref = React.useRef(null);
              const inView = useInView(ref, { amount: 0.1 });
              return (
                <motion.div
                  ref={ref}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.6, delay: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-green-400 to-blue-400 shadow-lg p-8 flex flex-col items-center border-2 border-green-300 bg-opacity-100 h-full min-w-[260px]"
                >
                  <span className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
                    Our Guarantee
                  </span>
                  <span className="text-lg md:text-xl text-white/90 text-center">
                    If it can be fixed, we will fix it.<br />And we won’t charge you unless we can.
                  </span>
                </motion.div>
              );
            })()}
            {/* Pie Chart and Legend */}
            {(() => {
              const ref = React.useRef(null);
              const inView = useInView(ref, { amount: 0.1 });
              useEffect(() => {
                if (inView) {
                  let start = 0;
                  let end = 1048;
                  let duration = 1200;
                  let startTime: number | null = null;
                  function animateCount(ts: number) {
                    if (startTime === null) startTime = ts;
                    const progress = Math.min((ts - startTime) / duration, 1);
                    setCount(Math.floor(progress * (end - start) + start));
                    setPieProgress(progress);
                    if (progress < 1) requestAnimationFrame(animateCount);
                  }
                  requestAnimationFrame(animateCount);
                } else {
                  setCount(0);
                  setPieProgress(0);
                }
              }, [inView]);
              // Calculate animated pie data
              const total = repairStats.reduce((sum, s) => sum + s.value, 0);
              const repaired = repairStats[0].value;
              const animatedValue = Math.floor(pieProgress * repaired);
              const animatedStats = [
                { ...repairStats[0], value: animatedValue },
                ...repairStats.slice(1)
              ];
              // Animate endAngle for the Pie
              const animatedEndAngle = 90 - 360 * (animatedValue / total);
              return (
                <motion.div
                  ref={ref}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="flex flex-col items-center justify-center h-full min-w-[260px]"
                >
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={animatedStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                          paddingAngle={2}
                          isAnimationActive={false}
                        >
                          {animatedStats.map((entry, idx) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered number and label */}
                    <div className="absolute left-0 top-1/2 w-full text-center" style={{ transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <span className="block text-3xl md:text-4xl font-bold text-[#7c3aed]">{animatedValue.toLocaleString()}</span>
                      <span className="block text-md text-slate-500">Repaired</span>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex justify-center gap-4 mt-4">
                    {repairStats.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1">
                        <span className="inline-block w-4 h-4 rounded-full" style={{ background: entry.color }}></span>
                        <span className="text-sm text-slate-700">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
            {/* Stats Banner */}
            {(() => {
              const ref = React.useRef(null);
              const inView = useInView(ref, { amount: 0.1 });
              return (
                <motion.div
                  ref={ref}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="rounded-2xl bg-[#7c3aed] p-8 bg-opacity-100 w-full text-center h-full flex flex-col justify-center min-w-[260px]"
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    1,048 computers saved from a hammer... and counting.
                  </h3>
                  <p className="text-lg text-white/90">Don't be the next victim of tech rage!</p>
                </motion.div>
              );
            })()}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-slate-800 text-center mb-8">
              Scream for Help
              <br />
              <span className="text-2xl md:text-3xl font-semibold block mt-2 text-[#7c3aed]">Or Just Call Us</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[420px]">
              <div className="flex flex-col h-full space-y-6">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border border-slate-300 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Contact Info</h3>
                  <div className="space-y-3 text-slate-600 flex-1">
                    <p>📍 Located in Shelbyville</p>
                    <p>📞 Call/Text: (XXX) XXX-XXXX</p>
                    <p>🌐 www.nerdherdrepair.com</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border border-slate-300 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Special Offers</h3>
                  <div className="space-y-3 text-slate-600 flex-1">
                    <p>✨ First-Time Fix Special: 10% Off</p>
                    <p>☕ Spilled Coffee Club – 10% Off</p>
                    <p>🎓 Student/Gamer Discount</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border border-slate-300">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Book Your Repair</h3>
                <form className="space-y-4">
                  {sosSuccess ? (
                    <div className="text-center space-y-4">
                      <div className="text-3xl">🎉</div>
                      <div className="text-xl font-bold text-[#7c3aed]">Thank you!</div>
                      <div>Your repair request has been received. A NerdHerd tech will contact you soon to confirm your repair.</div>
                    </div>
                  ) : (
                  <>
                  {sosError && <div className="text-red-500 text-sm mb-2">{sosError}</div>}
                  <div className="flex gap-2">
                    <input name="name" type="text" placeholder="Name*" className="flex-1 p-3 rounded-xl border border-purple-200" required value={sosForm.name} onChange={handleSosChange} />
                    <input name="email" type="email" placeholder="Email*" className="flex-1 p-3 rounded-xl border border-purple-200" required value={sosForm.email} onChange={handleSosChange} />
                  </div>
                  <input name="phone" type="text" placeholder="Phone (optional)" className="w-full p-3 rounded-xl border border-purple-200" value={sosForm.phone} onChange={handleSosChange} />
                  <div className="grid grid-cols-3 gap-2">
                    <select name="deviceType" className="p-3 rounded-xl border border-purple-200" required value={sosForm.deviceType} onChange={handleSosChange}>
                      <option value="">Device Type*</option>
                      <option>Laptop</option>
                      <option>Desktop</option>
                      <option>Phone</option>
                      <option>Tablet</option>
                      <option>Other</option>
                    </select>
                    <input name="brand" type="text" placeholder="Brand" className="p-3 rounded-xl border border-purple-200" value={sosForm.brand} onChange={handleSosChange} />
                    <input name="model" type="text" placeholder="Model" className="p-3 rounded-xl border border-purple-200" value={sosForm.model} onChange={handleSosChange} />
                  </div>
                  <textarea name="problem" placeholder="Describe the problem*" rows={3} className="w-full p-3 rounded-xl border border-purple-200" required value={sosForm.problem} onChange={handleSosChange} />
                  <div className="flex gap-2">
                    <select name="contactMethod" className="flex-1 p-3 rounded-xl border border-purple-200" value={sosForm.contactMethod} onChange={handleSosChange}>
                      <option value="Either">Either</option>
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                    </select>
                    <input name="repairTime" type="text" placeholder="Preferred Time (optional)" className="flex-1 p-3 rounded-xl border border-purple-200" value={sosForm.repairTime} onChange={handleSosChange} />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="remote" checked={sosForm.remote} onChange={handleSosChange} />
                    I’d like remote assistance if possible
                  </label>
                  <button type="submit" className="w-full py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl text-lg" disabled={sosLoading} onClick={handleSosSubmit}>
                    {sosLoading ? 'Sending...' : 'Send SOS Signal'}
                  </button>
                  </>
                  )}
                </form>
              </div>
            </div>
        </div>
      </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-white/50">
          <div className="max-w-7xl mx-auto text-center">
            <img src="/NerdHerdNewLogo.svg" alt="NerdHerd Tech Repair" className="mx-auto mb-6 h-20" style={{ filter: 'brightness(0) saturate(100%) invert(48%) sepia(97%) saturate(749%) hue-rotate(222deg) brightness(101%) contrast(101%)' }} />
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#hero" className="text-slate-600 hover:text-slate-800 transition-colors">Home</a>
              <a href="#services" className="text-slate-600 hover:text-slate-800 transition-colors">Services</a>
              <a href="#about" className="text-slate-600 hover:text-slate-800 transition-colors">About</a>
              <a href="#contact" className="text-slate-600 hover:text-slate-800 transition-colors">Contact</a>
            </div>
            <p className="text-slate-500 mb-4">
              Powered by caffeine and sheer tech wizardry.
            </p>
            <p className="text-slate-400 text-sm">
              © 2024 NerdHerd Tech Repair. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
      {/* Persistent purple line at the bottom of the viewport */}
      <div style={{ position: 'fixed', left: 0, bottom: 0, width: '100vw', height: '6px', background: '#7c3aed', zIndex: 100 }} />
      {/* Place BookingModal at the root so it overlays everything */}
      <BookingModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DefaultLayout>
  );
}
