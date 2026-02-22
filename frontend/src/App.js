import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PITCalculator from "@/pages/PITCalculator";
import PAYECalculator from "@/pages/PAYECalculator";
import BusinessCalculator from "@/pages/BusinessCalculator";
import EducationPage from "@/pages/EducationPage";
import DashboardPage from "@/pages/DashboardPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/calculator/pit" element={<PITCalculator />} />
              <Route path="/calculator/paye" element={<PAYECalculator />} />
              <Route path="/calculator/business" element={<BusinessCalculator />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
