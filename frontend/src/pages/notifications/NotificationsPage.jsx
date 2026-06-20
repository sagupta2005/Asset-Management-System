import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Trash2, MailOpen, AlertTriangle, Calendar, Info, ShieldAlert } from 'lucide-react'
import { notificationApi } from '../../api/index'
import { formatDate, getErrorMessage } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'

export default function NotificationsPage() {
  const qc = useQueryClient()
  const { success, error } = useToast()
  const [page, setPage] = useState(0)
  const [unreadOnly, setUnreadOnly] = useState(false)

  // Fetch notifications list
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['notifications', 'list', { page, unreadOnly }],
    queryFn: () => notificationApi.getAll({
      page,
      size: 15,
      unreadOnly: unreadOnly || undefined
    }).then(r => r.data.data),
    keepPreviousData: true,
  })

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      success('All notifications marked as read')
      qc.invalidateQueries(['notifications'])
    },
    onError: e => error(getErrorMessage(e))
  })

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      success('Notification marked as read')
      qc.invalidateQueries(['notifications'])
    },
    onError: e => error(getErrorMessage(e))
  })

  const getNotificationIcon = (type) => {
    const style = { padding: '8px', borderRadius: '8px' }
    switch (type) {
      case 'WARRANTY':
        return <ShieldAlert size={18} className="text-amber-500 bg-amber-500/10" style={style} />
      case 'MAINTENANCE':
        return <AlertTriangle size={18} className="text-red-500 bg-red-500/10" style={style} />
      case 'SYSTEM':
      default:
        return <Info size={18} className="text-blue-500 bg-blue-500/10" style={style} />
    }
  }

  const notifications = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalEl = data?.totalElements || 0

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-6 rounded-full" style={{ background: '#8B0000' }} />
            <h1 className="page-title">Notifications Center</h1>
          </div>
          <p className="page-subtitle pl-3">Stay updated with asset warranty expiries, repair schedules, and compliance updates</p>
        </div>
        <button
          onClick={() => markAllReadMutation.mutate()}
          disabled={notifications.length === 0}
          className="btn-secondary btn-sm flex items-center gap-1.5"
        >
          <CheckCheck size={14} />
          Mark All as Read
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          onClick={() => { setUnreadOnly(false); setPage(0) }}
          className={`tab-btn ${!unreadOnly ? 'active' : ''}`}
        >
          All Notifications ({!unreadOnly ? totalEl : '—'})
        </button>
        <button
          onClick={() => { setUnreadOnly(true); setPage(0) }}
          className={`tab-btn ${unreadOnly ? 'active' : ''}`}
        >
          Unread Only ({unreadOnly ? totalEl : '—'})
        </button>
      </div>

      {/* Notifications Container */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex gap-4">
                <div className="skeleton w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/4 rounded" />
                  <div className="skeleton h-3 w-3/4 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
            <Bell size={28} className="mx-auto mb-3 opacity-40 text-indigo-400" />
            <p className="font-semibold">No notifications to display</p>
            <p className="text-xs mt-0.5">We will alert you when system milestones or actions are triggered.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`card p-4 transition-all border flex gap-4 items-start ${
                !n.isRead ? 'border-l-4' : ''
              }`}
              style={{
                borderColor: !n.isRead ? 'var(--ams-blue-mid)' : 'rgb(var(--border-color))',
                background: !n.isRead ? 'rgba(37, 99, 235, 0.03)' : 'rgb(var(--bg-surface))'
              }}
            >
              {getNotificationIcon(n.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-sm font-semibold truncate" style={{ color: 'rgb(var(--text-primary))' }}>
                    {n.title}
                  </h3>
                  <span className="text-xs flex items-center gap-1" style={{ color: 'rgb(var(--text-muted))' }}>
                    <Calendar size={11} />
                    {formatDate(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => markReadMutation.mutate(n.id)}
                  title="Mark as read"
                  className="btn-icon text-indigo-400 hover:text-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/15"
                >
                  <MailOpen size={13} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="pagination-btn disabled:opacity-40">
              &lsaquo; Prev
            </button>
            <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} className="pagination-btn disabled:opacity-40">
              Next &rsaquo;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
