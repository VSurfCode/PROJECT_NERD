import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import DiagnosisForm from '@/pages/diagnosis';
import ChatbotPage from '@/pages/chatbot';
import AdminDashboard from '@/pages/admin';

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<PricingPage />} path="/pricing" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<DiagnosisForm />} path="/diagnosis" />
      <Route element={<ChatbotPage />} path="/chatbot" />
      <Route element={<AdminDashboard />} path="/admin" />
    </Routes>
  );
}

export default App;
