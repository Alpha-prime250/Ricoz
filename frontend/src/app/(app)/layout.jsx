"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Every page inside the (app) route group needs a signed-in user and gets the sidebar shell.
export default function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}
