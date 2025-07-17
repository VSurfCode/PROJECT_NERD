import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/navbar';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import * as THREE from 'three';
import { db } from '@/config/firebase';
import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODERATION_URL = 'https://api.openai.com/v1/moderations';

function getSystemPrompt(form: any) {
  return `You are Nerdy McBotface, NerdHerd Tech Repair's helpful assistant chatbot. The user is seeking a tech diagnosis. The goal is to help the user feel comfortable and understood. Here is their info:\nName: ${form.name}\nDevice: ${form.deviceType} (${form.brand} ${form.model})\nProblem: ${form.problem}\nReply in markdown. Keep answers short, concise, and easy to read. Use simple language and avoid technical jargon or super techy words. Use lists or formatting if helpful. Never provide a direct fix or solution. Ask as many contextually relevant, diagnostic questions as needed, one at a time, based on the user's previous answers and the specific device/problem they described. Do not repeat questions. Only give a diagnosis when you have enough specific information to make a meaningful guess about the problem. If you have asked 10 questions and still cannot confidently diagnose, tell the user to reach out to a NerdHerd tech for further help and stop asking questions. When you give a diagnosis, say 'I have a few ideas of whats going on' and make it clear this is a Free Diagnosis for the user. Then offer possible causes, but always encourage the user to contact a NerdHerd employee for a solution or repair. Do not diagnose or guarantee a fix; your goal is to guide the user to reach out to NerdHerd for help. In your very first message, introduce yourself as Nerdy McBotface, the NerdHerd chatbot.`;
}

type Message = { from: string; text: string };

// Replace SpinningCube with a vanilla three.js canvas component
function SpinningCube({ color = '#a21caf' }: { color?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(80, 80);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(2, 2, 2);
    camera.lookAt(0, 0, 0);
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    let frameId: number;
    function animate() {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [color]);
  return <canvas ref={canvasRef} width={80} height={80} style={{ display: 'block' }} />;
}

// Add a utility to normalize and check for the diagnosis phrase
function containsDiagnosisPhrase(text: string) {
  // Remove punctuation, lowercase, and check for the phrase
  const normalized = text.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
  return normalized.includes('i have a few ideas of whats going on');
}

// Add a utility to extract possible problems from the latest bot diagnosis message
function extractPossibleProblems(text: string) {
  // Try to extract markdown list items or bolded/bullet points as possible problems
  // This is a simple heuristic: split by newlines, look for lines starting with '-', '*', or bolded phrases
  const lines = text.split('\n');
  const problems = [];
  for (let line of lines) {
    const trimmed = line.trim();
    // Markdown list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      problems.push(trimmed.replace(/^[-*] /, ''));
    } else if (/^\*\*.+\*\*/.test(trimmed)) {
      problems.push(trimmed.replace(/\*\*/g, ''));
    } else if (/^\d+\. /.test(trimmed)) {
      problems.push(trimmed.replace(/^\d+\. /, ''));
    } else if (/^\w+:/.test(trimmed)) {
      problems.push(trimmed);
    }
  }
  // If no list found, fallback to splitting by sentences after the diagnosis phrase
  if (problems.length === 0) {
    const idx = text.toLowerCase().indexOf("i have a few ideas of what's going on");
    if (idx !== -1) {
      const after = text.slice(idx + 33).split(/\n|\./).map(s => s.trim()).filter(Boolean);
      problems.push(...after);
    }
  }
  // Remove duplicates and empty
  return Array.from(new Set(problems)).filter(Boolean);
}

function isProblemObj(prob: any): prob is { title: string; desc?: string } {
  return prob && typeof prob === 'object' && 'title' in prob;
}

// Moderation function using OpenAI's Moderation API
async function moderateUserInput(input: string): Promise<{ flagged: boolean; categories?: any }> {
  const res = await fetch(OPENAI_MODERATION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) throw new Error('Moderation API error');
  const data = await res.json();
  // data.results[0].flagged is true if flagged
  return { flagged: data.results?.[0]?.flagged, categories: data.results?.[0]?.categories };
}

export default function ChatbotPage() {
  const [form, setForm] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  // Add state to track number of bot questions before diagnosis
  const [botQuestionsAsked, setBotQuestionsAsked] = useState(0);
  const [diagnosisTriggered, setDiagnosisTriggered] = useState(false);
  const [showMobileDiagnosis, setShowMobileDiagnosis] = useState(false);
  const [maxQuestionsReached, setMaxQuestionsReached] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = localStorage.getItem('diagnosisForm');
    if (data) {
      const parsed = JSON.parse(data);
      setForm(parsed);
      setMessages([
        { from: 'bot', text: `Hi ${parsed.name || 'there'}! I'm **Nerdy McBotface**, the NerdHerd chatbot. Let's see if we can help with your ${parsed.deviceType || 'device'} (${parsed.brand} ${parsed.model}).` },
        { from: 'bot', text: `You said: "${parsed.problem}"` },
        { from: 'bot', text: 'How can I help you today? (Describe your issue or ask a question!)' },
      ]);
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    // Refocus input when a new bot message is added
    if (messages.length > 0 && messages[messages.length - 1].from === 'bot' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, loading]);

  // Update the effect that triggers the diagnosis panel
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].from === 'bot') {
      if (containsDiagnosisPhrase(messages[messages.length - 1].text)) {
        setTimeout(() => {
          setDiagnosisTriggered(true);
          setShowDiagnosis(true);
        }, 800);
      }
    }
  }, [messages]);

  // Example possible problems (in real use, these would come from the AI)
  const possibleProblems = [
    {
      title: 'Possible Problem: Power Supply',
      desc: 'Your device might not be getting enough power. This can happen if the power cable is loose or the battery is low.',
      chartData: [
        { name: 'Power Issue', value: 70 },
        { name: 'Other', value: 30 },
      ],
    },
    {
      title: 'Possible Problem: Software Glitch',
      desc: 'Sometimes, a simple restart can fix weird issues. It could also be a software update problem.',
      chartData: [
        { name: 'Software', value: 60 },
        { name: 'Other', value: 40 },
      ],
    },
  ];

  async function fetchOpenAIResponse(userMessages: Message[], form: any) {
    const chatHistory = [
      { role: 'system', content: getSystemPrompt(form) },
      ...userMessages.map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })),
    ];
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: chatHistory,
        temperature: 0.6,
        max_tokens: 256,
      }),
    });
    if (!res.ok) throw new Error('OpenAI API error');
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || maxQuestionsReached) return;
    setLoading(true);
    try {
      // Moderation step
      const moderationResult = await moderateUserInput(input);
      if (moderationResult.flagged) {
        setMessages(msgs => [
          ...msgs,
          { from: 'bot', text: 'Sorry, your message appears to contain inappropriate or unsafe language. Please rephrase and try again.' }
        ]);
        setLoading(false);
        return;
      }
      const newMessages = [...messages, { from: 'user', text: input }];
      setMessages(newMessages);
      setInput('');
      const reply = await fetchOpenAIResponse(newMessages, form);
      const diagnosisRegex = /i have a few ideas of what'?s going on[.!:]?/i;
      // Allow a diagnosis at any time if the AI feels it has enough information
      if (diagnosisRegex.test(reply)) {
        let updatedReply = reply;
        if (!/free diagnosis/i.test(reply)) {
          updatedReply = reply.replace(diagnosisRegex, (match: string) => `${match} Here is your Free Diagnosis:`);
        }
        setMessages(msgs => [...msgs, { from: 'bot', text: updatedReply }]);
        setTimeout(() => {
          setDiagnosisTriggered(true);
          setShowDiagnosis(true);
        }, 800);
      } else {
        setMessages(msgs => [...msgs, { from: 'bot', text: reply }]);
        setBotQuestionsAsked(q => {
          const next = q + 1;
          if (next >= 10) {
            setMaxQuestionsReached(true);
            setMessages(msgs => [...msgs, { from: 'bot', text: 'I\'ve asked as many questions as I can. For further help, please reach out to a NerdHerd tech for a more in-depth diagnosis!' }]);
          }
          return next;
        });
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Sorry, there was a problem contacting the diagnosis bot.' }]);
    }
    setLoading(false);
  };

  // Save diagnosis to Firestore when showDiagnosis becomes true
  useEffect(() => {
    if (showDiagnosis && form && messages.length > 0) {
      const saveData = async () => {
        try {
          // Use dynamicProblems from the chat, not the static possibleProblems
          const normalizedProblems = (dynamicProblems || []).map((prob: any) => {
            if (typeof prob === 'string') {
              return { title: prob, desc: '', chartData: [] };
            }
            return {
              title: prob.title || prob.toString() || '',
              desc: prob.desc || '',
              chartData: Array.isArray(prob.chartData) ? prob.chartData : [],
            };
          });
          await addDoc(collection(db, 'diagnoses'), {
            conversation: messages,
            possibleProblems: normalizedProblems,
            createdAt: Timestamp.now(),
          });
          const userId = localStorage.getItem('userId');
          if (userId) {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              diagnoses: arrayUnion({
                conversation: messages,
                possibleProblems: normalizedProblems,
                createdAt: Timestamp.now(),
              })
            });
          }
        } catch (err) {
          // Optionally handle error (e.g., show toast)
        }
      };
      saveData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDiagnosis]);

  if (!form) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  // Animation for chat messages
  const bounceVariants = {
    initial: { y: 40, opacity: 0, scale: 0.95 },
    animate: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.5, duration: 0.6 } },
    exit: { y: -40, opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  // In the diagnosis panel, use the extracted problems from the latest bot diagnosis message
  // Replace findLast with a manual reverse search for compatibility
  let latestDiagnosisMsg: Message | undefined = undefined;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.from === 'bot' && containsDiagnosisPhrase(m.text)) {
      latestDiagnosisMsg = m;
      break;
    }
  }
  const dynamicProblems: (string | { title: string; desc?: string })[] = latestDiagnosisMsg ? extractPossibleProblems(latestDiagnosisMsg.text) : [];

  const showMobileTabs = diagnosisTriggered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col bp1000:flex-row items-stretch justify-center relative w-full overflow-hidden pt-0 bp1000:pt-24">
        <motion.div
          initial={diagnosisTriggered ? { x: -100, opacity: 0 } : { x: 0, opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className={`flex flex-col h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)] bg-transparent border-r border-purple-100 z-10 transition-all duration-500
            ${diagnosisTriggered ? 'bp1000:w-1/2 min-w-[400px]' : 'w-full'}
            ${diagnosisTriggered && showMobileDiagnosis ? 'hidden bp1000:flex' : 'flex'}
          `}
          style={{ transition: 'width 0.5s' }}
        >
          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 pt-8 pb-4 w-full max-w-2xl mx-auto space-y-3 hide-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  variants={bounceVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.from === 'bot' ? (
                    <div className="px-5 py-3 rounded-2xl max-w-[80%] text-lg shadow bg-purple-100 text-purple-900 prose prose-slate prose-a:text-purple-700 prose-pre:bg-slate-100">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="px-5 py-3 rounded-2xl max-w-[80%] text-lg shadow bg-purple-500 text-white">
                      {msg.text}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="w-full flex justify-center items-center py-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-purple-400 mx-1"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <form
            onSubmit={send}
            className="w-full max-w-2xl mx-auto px-4 pb-4 pt-2 bg-gradient-to-t from-white/90 to-transparent sticky bottom-0 z-20"
          >
            <div className="flex w-full gap-2">
              <input
                ref={inputRef}
                className="flex-1 p-4 rounded-xl border-2 border-purple-200 text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
                disabled={loading}
              />
              <button type="submit" className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow" disabled={loading}>Send</button>
            </div>
          </form>
        </motion.div>
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
} 