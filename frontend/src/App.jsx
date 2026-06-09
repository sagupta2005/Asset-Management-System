import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/common/ErrorBoundary'
import PageLoader from './components/common/PageLoader'
import NotFoundPage from './components/common/NotFoundPage'
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute'

// ─── Lazy-loaded routes (code splitting) ─────────────────────────────────────
const AppLayout       = lazy(() => import('./components/layout/AppLayout'))
const LoginPage       = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage    = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPassword  = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const DashboardPage   = lazy(() => import('./pages/dashboard/DashboardPage'))
const AssetsPage      = lazy(() => import('./pages/assets/AssetsPage'))
const AssetFormPage   = lazy(() => import('./pages/assets/AssetFormPage'))
const ReportsPage     = lazy(() => import('./pages/reports/ReportsPage'))
const AiAssistantPage = lazy(() => import('./pages/ai/AiAssistantPage'))
const QrScannerPage   = lazy(() => import('./pages/qr/QrScannerPage'))
const OcrScannerPage  = lazy(() => import('./pages/ocr/OcrScannerPage'))

// ─── Query Client ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000, // 30 seconds
    },
  },
})

// ─── Edit Asset Route ─────────────────────────────────────────────────────────
function EditAssetRoute() {
  const { id } = useParams()
  return <AssetFormPage assetId={id} />
}

// ─── Module Under Development Placeholder ────────────────────────────────────
function ModulePlaceholder({ title }) {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-1 h-6 rounded-full" style={{ background: '#8B0000' }} />
          <h1 className="page-title">{title}</h1>
        </div>
        <p className="page-subtitle pl-3">This module is under active development.</p>
      </div>
      <div className="card p-8 text-center"
           style={{ borderTop: '3px solid #8B0000' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
             style={{ background: 'rgba(139,0,0,0.08)', border: '1px solid rgba(139,0,0,0.2)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <h2 className="text-base font-semibold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          {title} — Coming Soon
        </h2>
        <p className="text-sm mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
          The backend API for this module is fully scaffolded and ready. The UI is being developed as part of the Indian Railways AMS roadmap.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
          {[
            { label: 'Backend API', status: 'Ready', ok: true },
            { label: 'Database Schema', status: 'Deployed', ok: true },
            { label: 'UI Development', status: 'In Progress', ok: false },
          ].map(({ label, status, ok }) => (
            <div key={label} className="p-3 rounded-md text-center"
                 style={{ background: 'rgb(var(--bg-elevated))', border: '1px solid rgb(var(--border-color))' }}>
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium mb-1 ${ok ? 'badge-success' : 'badge-warning'}`}>
                {ok ? '✓' : '...'} {status}
              </div>
              <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── IR-themed Toaster config ────────────────────────────────────────────────
const toastOptions = {
  style: {
    background: 'rgb(10, 22, 40)',
    color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
  },
  success: {
    iconTheme: { primary: '#16a34a', secondary: '#fff' },
    style: { borderLeft: '3px solid #16a34a' },
  },
  error: {
    iconTheme: { primary: '#8B0000', secondary: '#fff' },
    style: { borderLeft: '3px solid #8B0000' },
  },
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public auth routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/register"        element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Protected app routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"        element={<DashboardPage />} />
                <Route path="/assets"           element={<AssetsPage />} />
                <Route path="/assets/new"       element={<AssetFormPage />} />
                <Route path="/assets/:id"       element={<ModulePlaceholder title="Asset Passport" />} />
                <Route path="/assets/:id/edit"  element={<EditAssetRoute />} />
                <Route path="/reports"          element={<ReportsPage />} />
                <Route path="/ai-assistant"     element={<AiAssistantPage />} />
                <Route path="/qr-scanner"      element={<QrScannerPage />} />
                <Route path="/ocr-scanner"      element={<OcrScannerPage />} />

                {/* Scaffolded modules */}
                {[
                  ['categories',   'Asset Categories'],
                  ['employees',    'Employees Management'],
                  ['allocation',   'Asset Allocation'],
                  ['vendors',      'Vendor Management'],
                  ['maintenance',  'Maintenance Management'],
                  ['return',       'Asset Returns'],
                  ['warranty',     'Warranty Tracker'],
                  ['depreciation', 'Depreciation Ledger'],
                  ['movements',    'Asset Movements'],
                  ['health',       'Asset Health Monitor'],
                  ['budget',       'Budget Forecasting'],
                  ['audit-logs',   'Audit Logs'],
                  ['notifications','Notifications Center'],
                  ['users',        'User Administration'],
                  ['settings',     'System Settings'],
                ].map(([path, title]) => (
                  <Route key={path} path={`/${path}`} element={<ModulePlaceholder title={title} />} />
                ))}
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-right"
          gutter={8}
          containerStyle={{ top: 80 }}
          toastOptions={toastOptions}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
