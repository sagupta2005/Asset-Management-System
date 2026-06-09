import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, Users, Building2,
  GitBranch, RotateCcw, Wrench, QrCode, BarChart3,
  Bell, Settings, UserCog, LogOut, ChevronRight
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

// ─── Nav structure matching design mockups ────────────────────────────────────
const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assets',      icon: Package,          label: 'Assets' },
  { to: '/categories',  icon: Tag,              label: 'Categories' },
  { to: '/employees',   icon: Users,            label: 'Employees' },
  { to: '/vendors',     icon: Building2,        label: 'Vendors' },
  { to: '/allocation',  icon: GitBranch,        label: 'Asset Assignment' },
  { to: '/return',      icon: RotateCcw,        label: 'Return Assets' },
  { to: '/maintenance', icon: Wrench,           label: 'Maintenance' },
  { to: '/qr-scanner',   icon: QrCode,           label: 'QR Code Scanner' },
  { to: '/reports',      icon: BarChart3,        label: 'Reports' },
  { to: '/notifications', icon: Bell,           label: 'Notifications' },
  { to: '/settings',    icon: Settings,         label: 'Settings' },
  { to: '/users',       icon: UserCog,          label: 'Users' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

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
        <div className="flex-shrink-0 px-4 py-4 flex items-center gap-3"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {/* AMS Logo mark */}
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: 'var(--ams-blue-mid)' }}>
            <span className="text-white font-bold text-sm tracking-tight">AMS</span>
          </div>
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight truncate">
              Asset Management
            </div>
            <div className="text-xs truncate"
                 style={{ color: 'rgba(100,140,210,0.8)', fontSize: '11px' }}>
              System v2.0
            </div>
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} className="flex-shrink-0" />
              <span className="text-sm truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── User Profile + Logout ─────────────────────────────────────────── */}
        <div className="flex-shrink-0 p-3"
             style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
               style={{ background: 'rgba(255,255,255,0.06)' }}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                 style={{ background: 'var(--ams-blue-mid)' }}>
              {initials(user)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.6)', fontSize: '10px' }}>
                {user?.roles?.[0]?.replace('ROLE_', '') || 'User'}
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
