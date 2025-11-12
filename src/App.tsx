import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CookieBanner } from "@/components/CookieBanner";
import { SaoMiguelRedirect } from "@/components/SaoMiguelRedirect";
import { RolaMaisRedirect } from "@/components/RolaMaisRedirect";
import { RostRedirect } from "@/components/RostRedirect";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WhatsAppConnect = lazy(() => import("./pages/WhatsAppConnect"));
const Admin = lazy(() => import("./pages/Admin"));
const ContactMessages = lazy(() => import("./pages/ContactMessages"));
const SaoMiguelDashboard = lazy(() => import("./pages/SaoMiguelDashboard"));
const RolaMaisDashboard = lazy(() => import("./pages/RolaMaisDashboard"));
const RostDashboard = lazy(() => import("./pages/RostDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Teste = lazy(() => import("./pages/Teste"));
const Palestra = lazy(() => import("./pages/Palestra"));
const PalestraGatilhos = lazy(() => import("./pages/PalestraGatilhos"));
const PalestraObrigado = lazy(() => import("./pages/PalestraObrigado"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
                      <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <Routes>
                    <Route path="/" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><Index /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/auth" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><Auth /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/reset-password" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><ResetPassword /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/dashboard" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><Dashboard /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/whatsapp-connect" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><WhatsAppConnect /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/admin" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><Admin /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/admin/contact-messages" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><ContactMessages /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/sao-miguel" element={<SaoMiguelDashboard />} />
                    <Route path="/rolamais" element={<RolaMaisDashboard />} />
                    <Route path="/rost" element={<RostDashboard />} />
                    <Route path="/privacy-policy" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><PrivacyPolicy /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/terms-of-service" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><TermsOfService /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/cookie-policy" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><CookiePolicy /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/teste" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><Teste /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                    <Route path="/palestra" element={<Palestra />} />
                    <Route path="/palestra/gatilhos" element={<PalestraGatilhos />} />
                    <Route path="/palestra/obrigado" element={<PalestraObrigado />} />
                    <Route path="*" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><NotFound /></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  </Routes>
                </Suspense>
                <CookieBanner />
              </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
