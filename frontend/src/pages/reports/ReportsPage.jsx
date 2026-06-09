import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Download, FileSpreadsheet, RefreshCw } from 'lucide-react'
import { reportApi } from '../../api/index'
import { downloadBlob, getErrorMessage } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'

const REPORTS = [
  {
    key: 'assets',
    title: 'Asset Report',
    description: 'Complete list of all assets with status, costs, and assignments',
    icon: '📦',
    color: '#6366f1',
    options: ['status'],
    fn: (params) => reportApi.downloadAssets(params),
  },
  {
    key: 'maintenance',
    title: 'Maintenance Report',
    description: 'Maintenance requests, costs, technicians, and completion status',
    icon: '🔧',
    color: '#f59e0b',
    fn: (params) => reportApi.downloadMaintenance(params),
  },
  {
    key: 'warranty',
    title: 'Warranty Report',
    description: 'Assets with upcoming warranty expiry in selected period',
    icon: '🛡️',
    color: '#10b981',
    options: ['days'],
    fn: (params) => reportApi.downloadWarranty(params),
  },
  {
    key: 'depreciation',
    title: 'Depreciation Report',
    description: 'Depreciation records with opening/closing values by financial year',
    icon: '📉',
    color: '#8b5cf6',
    options: ['financialYear'],
    fn: (params) => reportApi.downloadDepreciation(params),
  },
]

export default function ReportsPage() {
  const { error } = useToast()
  const [loadingKey, setLoadingKey] = useState(null)
  const [filters, setFilters] = useState({})

  const download = async (report, format) => {
    const key = `${report.key}_${format}`
    setLoadingKey(key)
    try {
      const params = { format, ...filters[report.key] }
      const res = await report.fn(params)
      const ext = format === 'excel' ? 'xlsx' : 'pdf'
      downloadBlob(res.data, `${report.key}_report.${ext}`)
    } catch (e) {
      error(getErrorMessage(e))
    } finally {
      setLoadingKey(null)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="page-title">Reports</h1>
            <p className="page-subtitle">Download PDF or Excel reports for all modules</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORTS.map(report => (
          <div key={report.key} className="card-hover p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                   style={{ background: `${report.color}18` }}>
                {report.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                  {report.title}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-muted))' }}>
                  {report.description}
                </p>

                {/* Filters */}
                {report.options?.includes('status') && (
                  <div className="mt-3">
                    <select
                      className="input text-sm w-full"
                      value={filters[report.key]?.status || ''}
                      onChange={e => setFilters(f => ({
                        ...f,
                        [report.key]: { ...f[report.key], status: e.target.value || undefined }
                      }))}
                    >
                      <option value="">All Statuses</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="UNDER_REPAIR">Under Repair</option>
                      <option value="DISPOSED">Disposed</option>
                    </select>
                  </div>
                )}
                {report.options?.includes('days') && (
                  <div className="mt-3">
                    <select
                      className="input text-sm w-full"
                      value={filters[report.key]?.days || '90'}
                      onChange={e => setFilters(f => ({
                        ...f,
                        [report.key]: { ...f[report.key], days: e.target.value }
                      }))}
                    >
                      <option value="30">Next 30 days</option>
                      <option value="60">Next 60 days</option>
                      <option value="90">Next 90 days</option>
                      <option value="180">Next 180 days</option>
                    </select>
                  </div>
                )}
                {report.options?.includes('financialYear') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="e.g. 2024-25"
                      className="input text-sm w-full"
                      value={filters[report.key]?.financialYear || ''}
                      onChange={e => setFilters(f => ({
                        ...f,
                        [report.key]: { ...f[report.key], financialYear: e.target.value || undefined }
                      }))}
                    />
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => download(report, 'pdf')}
                    disabled={loadingKey === `${report.key}_pdf`}
                    className="btn-primary btn-sm flex-1 justify-center"
                  >
                    {loadingKey === `${report.key}_pdf` ? (
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download size={13} />
                    )}
                    PDF
                  </button>
                  <button
                    onClick={() => download(report, 'excel')}
                    disabled={loadingKey === `${report.key}_excel`}
                    className="btn-secondary btn-sm flex-1 justify-center"
                  >
                    {loadingKey === `${report.key}_excel` ? (
                      <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <FileSpreadsheet size={13} />
                    )}
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
