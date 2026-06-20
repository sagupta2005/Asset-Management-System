import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, Users, Building2,
  GitBranch, RotateCcw, Wrench, QrCode, BarChart3,
  Bell, Settings, UserCog, LogOut, ChevronRight, Shield, Landmark
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../../store/authStore'
import useLanguageStore from '../../store/languageStore'
import { useTranslation } from '../../utils/translations'
import {
  dashboardApi,
  employeeApi,
  vendorApi,
  allocationApi,
  maintenanceApi,
  warrantyApi,
  depreciationApi,
  assetApi
} from '../../api/index'

// ─── Grouped Nav structure matching design mockups ────────────────────────────
const navigationGroups = [
  {
    title: 'Core Operations',
    items: [
      { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/assets',      icon: Package,          label: 'Assets' },
      { to: '/categories',  icon: Tag,              label: 'Categories',          roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
      { to: '/employees',   icon: Users,            label: 'Employees',           roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
      { to: '/vendors',     icon: Building2,        label: 'Vendors',             roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    ]
  },
  {
    title: 'Asset Lifecycle',
    items: [
      { to: '/allocation',  icon: GitBranch,        label: 'Asset Assignment',    roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
      { to: '/return',      icon: RotateCcw,        label: 'Return Assets' },
      { to: '/maintenance', icon: Wrench,           label: 'Maintenance' },
    ]
  },
  {
    title: 'Finance & Planning',
    items: [
      { to: '/warranty',     icon: Shield,           label: 'Warranty Tracker',     roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
      { to: '/depreciation', icon: Landmark,         label: 'Depreciation Ledger',  roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
      { to: '/reports',      icon: BarChart3,        label: 'Reports',             roles: ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'] },
    ]
  },
  {
    title: 'Tools & System',
    items: [
      { to: '/qr-scanner',   icon: QrCode,           label: 'QR Code Scanner' },
      { to: '/notifications', icon: Bell,           label: 'Notifications' },
      { to: '/settings',    icon: Settings,         label: 'Settings' },
      { to: '/users',       icon: UserCog,          label: 'Users',               roles: ['ROLE_SUPER_ADMIN'] },
    ]
  }
]


export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const { lang } = useLanguageStore()
  const t = useTranslation(lang)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const prefetchRouteData = (route) => {
    try {
      if (route === '/dashboard') {
        const fetchDashboard = () => {
          queryClient.prefetchQuery({ queryKey: ['dashboard', 'stats'], queryFn: () => dashboardApi.getStats().then(r => r.data.data) })
          queryClient.prefetchQuery({ queryKey: ['dashboard', 'category'], queryFn: () => dashboardApi.getCategoryChart().then(r => r.data.data) })
          queryClient.prefetchQuery({ queryKey: ['dashboard', 'status'], queryFn: () => dashboardApi.getStatusChart().then(r => r.data.data) })
          queryClient.prefetchQuery({ queryKey: ['dashboard', 'health'], queryFn: () => dashboardApi.getHealthChart().then(r => r.data.data) })
          queryClient.prefetchQuery({ queryKey: ['dashboard', 'department'], queryFn: () => dashboardApi.getDepartmentChart().then(r => r.data.data) })
        }
        fetchDashboard()
      } else if (route === '/assets') {
        queryClient.prefetchQuery({
          queryKey: ['assets', { page: 0, search: '', status: '' }],
          queryFn: () => assetApi.getAll({ page: 0, size: 20 }).then(r => r.data.data)
        })
      } else if (route === '/employees') {
        queryClient.prefetchQuery({
          queryKey: ['employees', { page: 0, search: '', department: '' }],
          queryFn: () => employeeApi.getAll({ page: 0, size: 20 }).then(r => r.data.data)
        })
      } else if (route === '/vendors') {
        queryClient.prefetchQuery({
          queryKey: ['vendors', { page: 0, search: '' }],
          queryFn: () => vendorApi.getAll({ page: 0, size: 20 }).then(r => r.data.data)
        })
      } else if (route === '/allocation') {
        queryClient.prefetchQuery({
          queryKey: ['allocations', { page: 0, search: '', status: '' }],
          queryFn: () => allocationApi.getAll({ page: 0, size: 20 }).then(r => r.data.data)
        })
      } else if (route === '/maintenance') {
        queryClient.prefetchQuery({
          queryKey: ['maintenance', { page: 0, search: '', status: '', priority: '' }],
          queryFn: () => maintenanceApi.getAll({ page: 0, size: 20 }).then(r => r.data.data)
        })
      } else if (route === '/warranty') {
        queryClient.prefetchQuery({
          queryKey: ['warranty', { page: 0, search: '', expiringInDays: '' }],
          queryFn: () => warrantyApi.getAll({ page: 0, size: 20 }).then(r => r.data.data)
        })
      } else if (route === '/depreciation') {
        queryClient.prefetchQuery({
          queryKey: ['depreciation', { page: 0, search: '' }],
          queryFn: () => depreciationApi.getRecords({ page: 0, size: 20 }).then(r => r.data.data)
        })
      }
    } catch (err) {
      console.warn('Prefetch failed for:', route, err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (u) => {
    const f = u?.firstName?.[0] || ''
    const l = u?.lastName?.[0] || ''
    return (f + l).toUpperCase() || 'U'
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        {/* ── Brand Header ──────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-4 py-5 flex items-center gap-3"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)' }}>
          {/* Official styled seal insignia */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-[#B8860B] shadow-lg"
               style={{ background: 'radial-gradient(circle, #8B0000 0%, #500000 100%)' }}>
            <span className="text-white font-black text-xs tracking-widest">IR</span>
          </div>
          <div className="min-w-0">
            <div className="text-white font-extrabold text-xs uppercase tracking-wider leading-none">
              भारतीय रेल
            </div>
            <div className="text-white font-bold text-sm leading-tight truncate mt-0.5">
              Indian Railways
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest"
                 style={{ color: 'var(--railway-gold)' }}>
              Asset Portal v2.0
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {navigationGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter(
              item => !item.roles || item.roles.some(role => user?.roles?.includes(role))
            )
            if (visibleItems.length === 0) return null
            return (
              <div key={groupIdx} className="mb-4">
                <div className="nav-section-label">{t(group.title)}</div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      onMouseEnter={() => prefetchRouteData(item.to)}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                      <item.icon size={16} className="flex-shrink-0" />
                      <span className="text-sm truncate">{t(item.label)}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        {/* ── User Profile + Logout ─────────────────────────────────────────── */}
        <div className="flex-shrink-0 p-3"
             style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
               style={{ background: 'rgba(255,255,255,0.06)' }}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                 style={{ background: 'var(--railway-crimson)' }}>
              {initials(user)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.6)', fontSize: '10px' }}>
                {user?.roles?.[0]?.replace('ROLE_', '')?.replace('_', ' ') || 'User'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
              title="Sign Out"
            >
              <LogOut size={14} className="text-red-400" />
            </button>
          </div>

          <p className="text-center pt-2" style={{ fontSize: '10px', color: 'rgba(100,120,160,0.4)' }}>
            AMS © {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  )
}
