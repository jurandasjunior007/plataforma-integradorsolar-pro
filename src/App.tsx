import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import DealsPage from "@/pages/DealsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ProductsPage from "@/pages/ProductsPage";
import ReportsPage from "@/pages/ReportsPage";
import AdminPage from "@/pages/AdminPage";
import PessoasPage from "@/pages/PessoasPage";
import EmpresasPage from "@/pages/EmpresasPage";
import EnderecosPage from "@/pages/EnderecosPage";
import ImportacaoPage from "@/pages/ImportacaoPage";
import DuplicidadesPage from "@/pages/DuplicidadesPage";
import DealViewPage from "@/pages/DealViewPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/cadastro/pessoas" element={<PessoasPage />} />
              <Route path="/cadastro/empresas" element={<EmpresasPage />} />
              <Route path="/cadastro/enderecos" element={<EnderecosPage />} />
              <Route path="/cadastro/importacao" element={<ImportacaoPage />} />
              <Route path="/cadastro/duplicidades" element={<DuplicidadesPage />} />
              <Route path="/clientes" element={<Navigate to="/cadastro/pessoas" replace />} />
              <Route path="/negocios" element={<DealsPage />} />
              <Route path="/negocios/:id" element={<DealViewPage />} />
              <Route path="/documentos" element={<DocumentsPage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/relatorios" element={<ReportsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
