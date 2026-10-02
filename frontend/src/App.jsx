import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Candidates from "./pages/Candidates";
import Interviews from "./pages/Interviews";
import Offers from "./pages/Offers";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/jobs" element={<Protected><Jobs /></Protected>} />
      <Route path="/jobs/:id" element={<Protected><JobDetail /></Protected>} />
      <Route path="/candidates" element={<Protected><Candidates /></Protected>} />
      <Route path="/interviews" element={<Protected><Interviews /></Protected>} />
      <Route path="/offers" element={<Protected><Offers /></Protected>} />
    </Routes>
  );
}
