import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit, Printer, QrCode, Package, Calendar, Tag, Building2, User, MapPin, DollarSign, Shield } from 'lucide-react'
import { assetApi } from '../../api/index'
import { formatDate, formatCurrency, getStatusClass, formatStatus } from '../../utils/formatters'
import useAuthStore from '../../store/authStore'

const tabs = ['Assignment History', 'Maintenance History', 'Activity Log']

const InfoRow = ({ label, value, mono }) => (
  <tr className="border-b" style={{ borderColor: 'rgb(var(--border-color))' }}>
    <td className="py-3 pr-4 text-sm font-medium w-40" style={{ color: 'rgb(var(--text-muted))' }}>
      {label}
    </td>
    <td className={`py-3 text-sm ${mono ? 'font-mono' : 'font-medium'}`}
        style={{ color: 'rgb(var(--text-primary))' }}>
      {value || '—'}
    </td>
  </tr>
)

export default function AssetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()
  const [activeTab, setActiveTab] = useState(0)

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetApi.getById(id).then(r => r.data.data || r.data),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="skeleton h-10 w-48 rounded-lg" />
        <div className="card p-6 space-y-4">
          <div className="skeleton h-6 w-64 rounded" />
          <div className="skeleton h-4 w-96 rounded" />
          <div className="skeleton h-40 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Asset not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary btn-sm mt-4">Go Back</button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
                  className="btn-icon w-8 h-8 rounded-lg"
                  style={{ background: 'rgb(var(--bg-elevated))', color: 'rgb(var(--text-secondary))' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">Asset Details</h1>
            <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
              Dashboard &rsaquo; <Link to="/assets" style={{ color: 'var(--ams-blue-mid)' }}>Assets</Link> &rsaquo; {asset.name}
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm">
            <Printer size={14} /> Print
          </button>
          {isAdmin && isAdmin() && (
            <Link to={`/assets/${id}/edit`} className="btn-primary btn-sm">
              <Edit size={14} /> Edit Asset
            </Link>
          )}
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Asset identity card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-6 text-center">
            {/* Asset image placeholder */}
            <div className="w-32 h-32 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ background: 'var(--ams-blue-pale)' }}>
              <Package size={52} style={{ color: 'var(--ams-blue-mid)' }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              {asset.name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
              {asset.brand} {asset.model}
            </p>

            {/* ID + Status row */}
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="table-asset-tag">
                ID: #{asset.id || asset.assetTag}
              </span>
              <span className={`badge ${getStatusClass(asset.status)}`}>
                {formatStatus(asset.status)}
              </span>
            </div>

            {/* Quick info pills */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              {[
                { icon: Tag,       label: 'Category',   val: asset.categoryName },
                { icon: Building2, label: 'Department',  val: asset.departmentName },
                { icon: User,      label: 'Assigned To', val: asset.assignedToName },
                { icon: MapPin,    label: 'Location',    val: asset.location },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="p-2.5 rounded-lg text-center"
                     style={{ background: 'rgb(var(--bg-elevated))' }}>
                  <Icon size={14} className="mx-auto mb-1" style={{ color: 'var(--ams-blue-mid)' }} />
                  <p className="text-xs font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                    {val || '—'}
                  </p>
                  <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial card */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
              Financial Info
            </h3>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'rgb(var(--text-muted))' }}>Purchase Price</span>
              <span className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                {formatCurrency(asset.purchaseCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'rgb(var(--text-muted))' }}>Purchase Date</span>
              <span style={{ color: 'rgb(var(--text-primary))' }}>
                {formatDate(asset.purchaseDate) || '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'rgb(var(--text-muted))' }}>Warranty Expiry</span>
              <span style={{ color: 'rgb(var(--text-primary))' }}>
                {formatDate(asset.warrantyExpiry) || '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'rgb(var(--text-muted))' }}>Vendor</span>
              <span style={{ color: 'rgb(var(--text-primary))' }}>
                {asset.vendorName || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Details + Tabs */}
        <div className="lg:col-span-2 space-y-4">

          {/* Specs Table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgb(var(--border-color))' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                Asset Specifications
              </h3>
            </div>
            <div className="px-5 py-2">
              <table className="w-full">
                <tbody>
                  <InfoRow label="Asset Name"    value={asset.name} />
                  <InfoRow label="Category"      value={asset.categoryName} />
                  <InfoRow label="Serial Number" value={asset.serialNumber} mono />
                  <InfoRow label="Model"         value={asset.model} />
                  <InfoRow label="Brand"         value={asset.brand} />
                  <InfoRow label="Location"      value={asset.location} />
                  <InfoRow label="Department"    value={asset.departmentName} />
                  <InfoRow label="Description"   value={asset.description} />
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabs */}
          <div className="card overflow-hidden">
            <div className="tab-bar px-4">
              {tabs.map((t, i) => (
                <button key={t} onClick={() => setActiveTab(i)}
                        className={`tab-btn ${activeTab === i ? 'active' : ''}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 0 && (
                <AssignmentHistory assetId={id} />
              )}
              {activeTab === 1 && (
                <MaintenanceHistory assetId={id} />
              )}
              {activeTab === 2 && (
                <ActivityLog assetId={id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-tab components ─────────────────────────────────────────────────────────
function AssignmentHistory({ assetId }) {
  // In a real app, fetch from allocations API
  const rows = [
    { to: 'John Doe',  assignedDate: '10-02-2021', returnDate: '15-01-2026', status: 'Current' },
    { to: 'Mike Johnson', assignedDate: '14-01-2021', returnDate: '10-02-2021', status: 'Returned' },
  ]
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Assigned To</th>
          <th>Assigned Date</th>
          <th>Return Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="font-medium text-sm" style={{ color: 'rgb(var(--text-primary))' }}>{r.to}</td>
            <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{r.assignedDate}</td>
            <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{r.returnDate}</td>
            <td>
              <span className={`badge ${r.status === 'Current' ? 'badge-info' : 'badge-success'}`}>
                {r.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MaintenanceHistory({ assetId }) {
  const rows = [
    { type: 'Network Issue', date: '10-05-2024', next: '10-11-2024', status: 'Completed' },
    { type: 'IT Segment',    date: '20-04-2024', next: '20-10-2024', status: 'Completed' },
  ]
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Date</th>
          <th>Next Due</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="font-medium text-sm" style={{ color: 'rgb(var(--text-primary))' }}>{r.type}</td>
            <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{r.date}</td>
            <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{r.next}</td>
            <td>
              <span className="badge badge-success">{r.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ActivityLog({ assetId }) {
  const logs = [
    { action: 'Asset Created',   user: 'Admin',     date: '01-01-2021 09:00' },
    { action: 'Assigned to John', user: 'Admin',    date: '10-02-2021 11:30' },
    { action: 'Maintenance Added', user: 'IT Staff', date: '10-05-2024 14:00' },
  ]
  return (
    <div className="space-y-3">
      {logs.map((l, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
               style={{ background: 'var(--ams-blue-mid)' }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{l.action}</p>
            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
              by {l.user} · {l.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
