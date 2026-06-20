import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { User, Shield, Bell, Save, Lock, Mail, Phone, Settings, RefreshCw } from 'lucide-react'
import { authApi } from '../../api/authApi'
import useAuthStore from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/formatters'

export default function SettingsPage() {
  const { updateUser } = useAuthStore()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  })

  // Password Form States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notification Preferences States
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailAlerts: true,
    maintenanceUpdates: true,
    systemAudits: true,
  })

  // Fetch complete profile details (including db columns)
  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => authApi.getProfile().then(r => r.data.data),
    onSuccess: (data) => {
      if (data) {
        setProfileForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
        })
        setNotificationPrefs({
          emailAlerts: data.emailAlerts ?? true,
          maintenanceUpdates: data.maintenanceUpdates ?? true,
          systemAudits: data.systemAudits ?? true,
        })
        // Also sync basic details back to zustand authStore
        updateUser({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        })
      }
    }
  })

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (res) => {
      success('Profile details updated successfully!')
      const updated = res.data.data
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
      })
      refetch()
    },
    onError: e => error(getErrorMessage(e))
  })

  // Password Change Mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      success('Password changed successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    },
    onError: e => error(getErrorMessage(e))
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileForm)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('Confirm password does not match new password')
      return
    }
    changePasswordMutation.mutate(passwordForm)
  }

  const handleTogglePref = (key) => {
    const newVal = !notificationPrefs[key]
    const updatedPrefs = { ...notificationPrefs, [key]: newVal }
    setNotificationPrefs(updatedPrefs)
    
    // Save immediately to backend
    updateProfileMutation.mutate(updatedPrefs)
  }

  const isSaving = updateProfileMutation.isLoading || changePasswordMutation.isLoading

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-6 rounded-full" style={{ background: '#8B0000' }} />
            <h1 className="page-title">Account Settings</h1>
          </div>
          <p className="page-subtitle pl-3">Manage profile information, notification preferences, and system security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Side: Tabs Navigation */}
        <div className="card p-3 md:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={16} />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          >
            <Shield size={16} />
            <span>Security Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          >
            <Bell size={16} />
            <span>Notification Toggles</span>
          </button>
        </div>

        {/* Right Side: Tab Contents Panel */}
        <div className="card p-6 md:col-span-3">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-sm text-muted">
              <RefreshCw size={24} className="animate-spin text-indigo-400" />
              <span>Loading account profile...</span>
            </div>
          ) : (
            <>
              {/* Profile Details Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <h2 className="text-base font-bold mb-2 flex items-center gap-2 text-base-primary">
                    <User size={18} className="text-indigo-400" /> Personal Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.firstName}
                        onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.lastName}
                        onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="form-label">Email Address (Read Only)</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="email"
                          disabled
                          value={profileData?.email || ''}
                          className="input pl-10 bg-elevated/50 cursor-not-allowed opacity-75"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="form-label">Phone Number</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="input pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t flex justify-end" style={{ borderColor: 'rgb(var(--border-color))' }}>
                    <button type="submit" disabled={isSaving} className="btn-primary btn-sm flex items-center gap-1.5"
                            style={{ background: 'var(--ams-blue-mid)' }}>
                      <Save size={14} />
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <h2 className="text-base font-bold mb-2 flex items-center gap-2 text-base-primary">
                    <Lock size={18} className="text-indigo-400" /> Update Password
                  </h2>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Enter new password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t flex justify-end" style={{ borderColor: 'rgb(var(--border-color))' }}>
                    <button type="submit" disabled={isSaving} className="btn-primary btn-sm flex items-center gap-1.5"
                            style={{ background: 'var(--ams-blue-mid)' }}>
                      <Shield size={14} />
                      {changePasswordMutation.isLoading ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* Notification Toggles Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h2 className="text-base font-bold mb-2 flex items-center gap-2 text-base-primary">
                    <Bell size={18} className="text-indigo-400" /> Notification Preferences
                  </h2>
                  <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Select which events triggers alert messages to your registered email/phone coordinates.
                  </p>

                  <div className="divide-y" style={{ borderColor: 'rgb(var(--border-color))' }}>
                    {[
                      {
                        key: 'emailAlerts',
                        title: 'General System Mailings',
                        desc: 'Receive alerts when credentials, allocations or profile data shifts.',
                      },
                      {
                        key: 'maintenanceUpdates',
                        title: 'Maintenance & Work Orders',
                        desc: 'Alerts when scheduled repairs, risk analysis updates or condition tasks are registered.',
                      },
                      {
                        key: 'systemAudits',
                        title: 'Security Audits & Logs',
                        desc: 'Notifications when logins or data reports exports are executed.',
                      }
                    ].map((pref) => (
                      <div key={pref.key} className="flex items-center justify-between py-4 gap-4">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{pref.title}</p>
                          <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{pref.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notificationPrefs[pref.key]}
                            onChange={() => handleTogglePref(pref.key)}
                          />
                          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
