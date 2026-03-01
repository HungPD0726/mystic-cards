import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/features/auth/context/AuthContext";

const queryClient = new QueryClient();
const ChatWidget = lazy(() => import("@/components/ChatWidget"));
const Index = lazy(() => import("./pages/Index"));
const ReadingPicker = lazy(() => import("./pages/ReadingPicker"));
const ReadingDraw = lazy(() => import("./pages/ReadingDraw"));
const ReadingResult = lazy(() => import("./pages/ReadingResult"));
const ReadingHistory = lazy(() => import("./pages/ReadingHistory"));
const CardLibrary = lazy(() => import("./pages/CardLibrary"));
const CardDetail = lazy(() => import("./pages/CardDetail"));
const Sky360 = lazy(() => import("./pages/Sky360"));
const Zodiac = lazy(() => import("./pages/Zodiac"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("@/features/auth/pages/Login"));
const Register = lazy(() => import("@/features/auth/pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div className="container mx-auto px-4 py-10">
      <p className="text-center text-sm text-muted-foreground">Dang tai...</p>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/reading" element={<ReadingPicker />} />
                <Route path="/reading/:spread" element={<ReadingDraw />} />
                <Route path="/reading/:spread/result" element={<ReadingResult />} />
                <Route path="/history" element={<ReadingHistory />} />
                <Route path="/cards" element={<CardLibrary />} />
                <Route path="/cards/:slug" element={<CardDetail />} />
                <Route path="/sky-360" element={<Sky360 />} />
                <Route path="/zodiac" element={<Zodiac />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Suspense fallback={null}>
              <ChatWidget />
            </Suspense>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
