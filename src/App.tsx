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

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WhatsAppConnect = lazy(() => import("./pages/WhatsAppConnect"));
const Admin = lazy(() => import("./pages/Admin"));
const ContactMessages = lazy(() => import("./pages/ContactMessages"));
const SaoMiguelDashboard = lazy(() => import("./pages/SaoMiguelDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Teste = lazy(() => import("./pages/Teste"));
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
                    <Route path="/" element={<SaoMiguelRedirect><Index /></SaoMiguelRedirect>} />
                    <Route path="/auth" element={<SaoMiguelRedirect><Auth /></SaoMiguelRedirect>} />
                    <Route path="/reset-password" element={<SaoMiguelRedirect><ResetPassword /></SaoMiguelRedirect>} />
                    <Route path="/dashboard" element={<SaoMiguelRedirect><Dashboard /></SaoMiguelRedirect>} />
                    <Route path="/whatsapp-connect" element={<SaoMiguelRedirect><WhatsAppConnect /></SaoMiguelRedirect>} />
                    <Route path="/admin" element={<SaoMiguelRedirect><Admin /></SaoMiguelRedirect>} />
                    <Route path="/admin/contact-messages" element={<SaoMiguelRedirect><ContactMessages /></SaoMiguelRedirect>} />
                    <Route path="/sao-miguel" element={<SaoMiguelDashboard />} />
                    <Route path="/privacy-policy" element={<SaoMiguelRedirect><PrivacyPolicy /></SaoMiguelRedirect>} />
                    <Route path="/terms-of-service" element={<SaoMiguelRedirect><TermsOfService /></SaoMiguelRedirect>} />
                    <Route path="/cookie-policy" element={<SaoMiguelRedirect><CookiePolicy /></SaoMiguelRedirect>} />
                    <Route path="/teste" element={<SaoMiguelRedirect><Teste /></SaoMiguelRedirect>} />
                    <Route path="*" element={<SaoMiguelRedirect><NotFound /></SaoMiguelRedirect>} />
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
