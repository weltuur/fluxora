import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { Landing } from '@/pages/public/Landing';
import { Pricing } from '@/pages/public/Pricing';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { Onboarding } from '@/pages/Onboarding';

import { Dashboard } from '@/pages/app/Dashboard';
import { Leads } from '@/pages/app/Leads';
import { Sales } from '@/pages/app/Sales';
import { SubscriptionPage } from '@/pages/app/Subscription';
import { SettingsPage } from '@/pages/app/Settings';
import { PlaceholderPage } from '@/pages/app/PlaceholderPage';
import { AdminPage } from '@/pages/app/Admin';
import { AdminRoute } from '@/components/AdminRoute';
import { ContentGenerator } from '@/pages/app/ContentGenerator';
import { HooksGenerator } from '@/pages/app/HooksGenerator';
import { X1Assistant } from '@/pages/app/X1Assistant';
import { Analytics } from '@/pages/app/Analytics';

import { BarChart3, Calendar, Sparkles } from 'lucide-react';
import CalendarPage from '@/pages/app/calendar';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/precos" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Signup />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />

          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* App (protected + onboarding required) */}
          <Route
            path="/app"
            element={
              <ProtectedRoute requireOnboarding>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/leads"
            element={
              <ProtectedRoute requireOnboarding>
                <Leads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/vendas"
            element={
              <ProtectedRoute requireOnboarding>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/assinatura"
            element={
              <ProtectedRoute requireOnboarding>
                <SubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/configuracoes"
            element={
              <ProtectedRoute requireOnboarding>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Content Generator (fully functional) */}
          <Route
            path="/app/conteudo"
            element={
              <ProtectedRoute requireOnboarding>
                <ContentGenerator />
              </ProtectedRoute>
            }
          />

          {/* Hooks Generator (fully functional) */}
          <Route
            path="/app/hooks"
            element={
              <ProtectedRoute requireOnboarding>
                <HooksGenerator />
              </ProtectedRoute>
            }
          />

          {/* X1 assistant */}
          <Route
            path="/app/x1"
            element={
              <ProtectedRoute requireOnboarding>
                <X1Assistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/analytics"
            element={
              <ProtectedRoute requireOnboarding>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/calendario"
            element={
              <ProtectedRoute requireOnboarding>
              
                 <CalendarPage />
            
                
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/fluxora-ai"
            element={
              <ProtectedRoute requireOnboarding>
                <PlaceholderPage
                  title="Fluxora AI"
                  description="Sua assistente inteligente para vender online"
                  icon={<Sparkles size={24} />}
                  badge="IA"
                />
              </ProtectedRoute>
            }
          />

          {/* Admin (backend-enforced, admin only) */}
          <Route
            path="/app/admin"
            element={
              <ProtectedRoute requireOnboarding>
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
