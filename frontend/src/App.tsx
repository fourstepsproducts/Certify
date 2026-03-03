import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import Pricing from "./pages/Pricing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Refund from "./pages/Refund";
import Modules from "./pages/Modules";
import ModuleDetail from "./pages/ModuleDetail";
import PublicRegistration from "./pages/PublicRegistration";
import PublicFeedback from "./pages/PublicFeedback";
import CertificateConfig from "./pages/CertificateConfig";
import QuickGenerator from "./pages/QuickGenerator";
import Onboarding from "./pages/Onboarding";
import UserDashboard from "./pages/UserDashboard";
import DashboardRedirect from "./pages/DashboardRedirect";
import { AuthProvider } from "./context/AuthContext";
import { CookieConsent } from "./components/shared/CookieConsent";
import * as Sentry from "@sentry/react";

const queryClient = new QueryClient();

const App = () => (
  <Sentry.ErrorBoundary fallback={<p>Something went wrong. Please refresh the page.</p>}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookieConsent />
        <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/organizer/dashboard" element={<Modules />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/modules/:id" element={<ModuleDetail />} />
              <Route path="/modules/:id/configure-certificate" element={<CertificateConfig />} />
              <Route path="/quick-create" element={<QuickGenerator />} />
              <Route path="/register/:linkId" element={<PublicRegistration />} />
              <Route path="/feedback/:linkId" element={<PublicFeedback />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Sentry.ErrorBoundary>
);

export default App;
