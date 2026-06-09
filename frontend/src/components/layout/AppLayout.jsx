import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import useThemeStore from '../../store/themeStore'

/**
 * Main application layout — sidebar + top bar + page content.
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <div className="min-h-screen bg-base">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(o => !o)} />
      <main className="page-container">
        <div className="page-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
