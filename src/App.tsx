
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import CourseDetail from "./pages/CourseDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import EnrolledCourses from "./pages/EnrolledCourses";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CareerTest from "./pages/CareerTest";
import MBTITestPage from "./pages/MBTITestPage";
import DriveViewer from "./pages/DriveViewer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="about" element={<About />} />
                <Route path="programs" element={<Programs />} />
                <Route path="course/:courseId" element={<CourseDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="enrolled-courses" element={<EnrolledCourses />} />
                <Route path="career-test" element={<CareerTest />} />
                <Route path="mbti-test" element={<MBTITestPage />} />
                <Route path="drive-viewer" element={<DriveViewer />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="login" element={<Login />} />
              <Route path="admin-login" element={<AdminLogin />} />
              <Route path="admin/*" element={<AdminDashboard />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
