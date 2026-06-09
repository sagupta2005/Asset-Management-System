import React, { useState, useRef, useEffect } from 'react'
import { Menu, Sun, Moon, Bell, Search, X, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useThemeStore from '../../store/themeStore'
import useAuthStore from '../../store/authStore'
import { notificationApi } from '../../api/index'
import { initials } from '../../utils/formatters'

export default function TopBar({ onMenuClick }) {
  const { isDark, toggleTheme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationApi.getUnreadCount().then(r => r.data.data),
    refetchInterval: 30000,
  })
  const unreadCount = unreadData || 0

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="fixed top-0 z-30 flex items-center"
      style={{
        left: 'var(--sidebar-width)',
        right: 0,
        height: 'var(--topbar-height)',
        background: 'rgb(var(--bg-surface))',
        borderBottom: '1px solid rgb(var(--border-color))',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}
    >
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile hamburger */}
        <button
          id="sidebar-menu-btn"
          onClick={onMenuClick}
          className="btn-icon md:hidden"
          style={{ color: 'rgb(var(--text-secondary))' }}
        >
          <Menu size={20} />
        </button>

        {/* Global search */}
        <div className="relative hidden md:flex items-center">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgb(var(--text-muted))' }}
          />
          <input
            id="topbar-search"
            type="text"
            placeholder="Search assets, categories, employees..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border outline-none transition-all w-72"
            style={{
              background: 'rgb(var(--bg-elevated))',
              borderColor: 'rgb(var(--border-color))',
              color: 'rgb(var(--text-primary))',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--ams-blue-mid)'
              e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgb(var(--border-color))'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
      </div>

      {/* Right: theme + notifications + user */}
      <div className="flex items-center gap-2">

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          onClick={toggleTheme}
          className="btn-icon w-9 h-9 rounded-lg"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ color: 'rgb(var(--text-secondary))', background: 'rgb(var(--bg-elevated))' }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          id="notifications-btn"
          className="btn-icon w-9 h-9 rounded-lg relative"
          style={{ color: 'rgb(var(--text-secondary))', background: 'rgb(var(--bg-elevated))' }}
          title="Notifications"
          onClick={() => navigate('/notifications')}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
              style={{ background: '#dc2626', fontSize: '9px' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-8 mx-1" style={{ background: 'rgb(var(--border-color))' }} />

        {/* User dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="user-menu-btn"
            onClick={() => setShowUserMenu(v => !v)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-150 hover:bg-elevated"
            style={{ background: showUserMenu ? 'rgb(var(--bg-elevated))' : 'transparent' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'var(--ams-blue-mid)' }}
            >
              {initials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold leading-tight" style={{ color: 'rgb(var(--text-primary))' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs leading-tight" style={{ color: 'rgb(var(--text-muted))' }}>
                Admin User
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'rgb(var(--text-muted))' }} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-lg overflow-hidden animate-scale-in z-50"
              style={{
                background: 'rgb(var(--bg-surface))',
                borderColor: 'rgb(var(--border-color))',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border-color))' }}>
                <p className="text-xs font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setShowUserMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-elevated text-left"
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                <Settings size={14} />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
                style={{ color: '#dc2626' }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
