import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import ReadingPicker from "./pages/ReadingPicker";
import ReadingDraw from "./pages/ReadingDraw";
import ReadingResult from "./pages/ReadingResult";
import CardLibrary from "./pages/CardLibrary";
import CardDetail from "./pages/CardDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reading" element={<ReadingPicker />} />
            <Route path="/reading/:spread" element={<ReadingDraw />} />
            <Route path="/reading/:spread/result" element={<ReadingResult />} />
            <Route path="/cards" element={<CardLibrary />} />
            <Route path="/cards/:slug" element={<CardDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
