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
import { RjDiehlRedirect } from "@/components/RjDiehlRedirect";

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
const RjDiehlDashboard = lazy(() => import("./pages/RjDiehlDashboard"));
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
                  <Route path="/" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><Index /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/auth" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><Auth /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/reset-password" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><ResetPassword /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/dashboard" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><Dashboard /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/whatsapp-connect" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><WhatsAppConnect /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/admin" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><Admin /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/admin/contact-messages" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><ContactMessages /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/sao-miguel" element={<SaoMiguelDashboard />} />
                  <Route path="/rolamais" element={<RolaMaisDashboard />} />
                  <Route path="/rost" element={<RostDashboard />} />
                  <Route path="/rj-diehl" element={<RjDiehlDashboard />} />
                  <Route path="/privacy-policy" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><PrivacyPolicy /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/terms-of-service" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><TermsOfService /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/cookie-policy" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><CookiePolicy /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/teste" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><Teste /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
                  <Route path="/palestra" element={<Palestra />} />
                  <Route path="/palestra/gatilhos" element={<PalestraGatilhos />} />
                  <Route path="/palestra/obrigado" element={<PalestraObrigado />} />
                  <Route path="*" element={<SaoMiguelRedirect><RolaMaisRedirect><RostRedirect><RjDiehlRedirect><NotFound /></RjDiehlRedirect></RostRedirect></RolaMaisRedirect></SaoMiguelRedirect>} />
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
