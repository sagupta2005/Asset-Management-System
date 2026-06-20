import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, RefreshCw, Eye, Edit, Trash2, QrCode, Download, FileSpreadsheet, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { assetApi, reportApi } from '../../api/index'
import { formatDate, formatCurrency, getStatusClass, formatStatus, downloadBlob, getErrorMessage } from '../../utils/formatters'
import { useDebounce } from '../../hooks/useDebounce'
import { useToast } from '../../hooks/useToast'
import { ASSET_STATUSES } from '../../utils/constants'
import useAuthStore from '../../store/authStore'
import useLanguageStore from '../../store/languageStore'
import { useTranslation } from '../../utils/translations'

export default function AssetsPage() {
  const { lang } = useLanguageStore()
  const t = useTranslation(lang)
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()
  const { success, error } = useToast()

  const [page, setPage]         = useState(0)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const debouncedSearch         = useDebounce(search, 400)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['assets', { page, search: debouncedSearch, status }],
    queryFn: () => assetApi.getAll({
      page, size: 20,
      search: debouncedSearch || undefined,
      status: status || undefined,
    }).then(r => r.data.data),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: assetApi.delete,
    onSuccess: () => {
      success('Asset deleted successfully')
      qc.invalidateQueries(['assets'])
      qc.invalidateQueries(['dashboard'])
    },
    onError: (err) => error(getErrorMessage(err)),
  })

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleDownload = async (format) => {
    success('Generating report...')
    try {
      const res = await reportApi.downloadAssets({ status: status || undefined, format })
      const ext = format === 'excel' ? 'xlsx' : 'pdf'
      downloadBlob(res.data, `assets_report.${ext}`)
    } catch (e) { error(getErrorMessage(e)) }
  }

  const assets        = data?.content || []
  const totalPages    = data?.totalPages || 0
  const totalElements = data?.totalElements || 0

  return (
    <div className="animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("Assets")}</h1>
          <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
            {t("Dashboard")} &rsaquo; <span style={{ color: 'var(--ams-blue-mid)' }}>{t("Assets")}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleDownload('excel')} className="btn-secondary btn-sm">
            <FileSpreadsheet size={14} />
            Generate QR
          </button>
          {isAdmin && isAdmin() && (
            <Link to="/assets/new" className="btn-primary btn-sm">
              <Plus size={14} />
              {t("Add Asset")}
            </Link>
          )}
        </div>
      </div>

      {/* ── Search & Filters ────────────────────────────────────────────────── */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1" style={{ minWidth: '220px' }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder={t("Search assets...")}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="search-input"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(0) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} style={{ color: 'rgb(var(--text-muted))' }} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(0) }}
            className="input text-sm h-[38px]"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="">{t("All Statuses")}</option>
            {ASSET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Actions */}
          <button
            onClick={() => { setSearch(''); setStatus(''); setPage(0) }}
            className="btn-secondary btn-sm"
          >
            {t("Clear")}
          </button>
          <button onClick={() => refetch()} className="btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => handleDownload('pdf')} className="btn-secondary btn-sm" title="Export PDF">
            <Download size={14} />
            {t("Export")}
          </button>
        </div>
      </div>

      {/* ── Table Card ──────────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
            {t("Asset Inventory")}
            <span className="ml-2 text-xs font-normal" style={{ color: 'rgb(var(--text-muted))' }}>
              ({totalElements} {t("total")})
            </span>
          </p>
          {isFetching && !isLoading && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
              <RefreshCw size={12} className="animate-spin" />
              Updating...
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("Asset ID")}</th>
                    <th>{t("Asset Name")}</th>
                    <th>{t("Category")}</th>
                    <th>{t("Serial Number")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Assigned To")}</th>
                    <th>{t("Purchase Cost")}</th>
                    <th>{t("Warranty")}</th>
                    <th className="text-center">{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center"
                               style={{ background: 'rgb(var(--bg-elevated))' }}>
                            <Package size={24} style={{ color: 'rgb(var(--text-muted))' }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                              {t("No assets found")}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                              {search ? 'Try adjusting your search terms' : 'Add your first asset to get started'}
                            </p>
                          </div>
                          {isAdmin && isAdmin() && !search && (
                            <Link to="/assets/new" className="btn-primary btn-sm">
                              <Plus size={13} /> {t("Add Asset")}
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : assets.map(asset => (
                    <tr key={asset.id}>
                      {/* Asset Tag */}
                      <td>
                        <Link to={`/assets/${asset.id}`}
                              className="table-asset-tag hover:underline">
                          #{asset.id || asset.assetTag}
                        </Link>
                      </td>

                      {/* Name + brand */}
                      <td>
                        <div className="font-medium text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                          {asset.name}
                        </div>
                        {asset.brand && (
                          <div className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                            {asset.brand} {asset.model}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {asset.categoryName || '—'}
                      </td>

                      {/* Serial */}
                      <td>
                        <span className="font-mono text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                          {asset.serialNumber || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${getStatusClass(asset.status)}`}>
                          {formatStatus(asset.status)}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {asset.assignedToName || '—'}
                      </td>

                      {/* Cost */}
                      <td className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                        {formatCurrency(asset.purchaseCost)}
                      </td>

                      {/* Warranty */}
                      <td className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                        {formatDate(asset.warrantyExpiry) || '—'}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-center gap-1.5">
                          <Link to={`/assets/${asset.id}`} className="btn-icon-view" title="View Details">
                            <Eye size={14} />
                          </Link>
                          {isAdmin && isAdmin() && (
                            <>
                              <Link to={`/assets/${asset.id}/edit`} className="btn-icon-edit" title="Edit">
                                <Edit size={14} />
                              </Link>
                              <button
                                onClick={() => handleDelete(asset.id, asset.name)}
                                className="btn-icon-delete"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t"
                   style={{ borderColor: 'rgb(var(--border-color))' }}>
                <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                  Showing {page * 20 + 1}–{Math.min((page + 1) * 20, totalElements)} of {totalElements}
                </p>
                <div className="flex items-center gap-1">
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                          className="pagination-btn disabled:opacity-40">
                    &lsaquo; Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = Math.max(0, page - 2) + i
                    if (p >= totalPages) return null
                    return (
                      <button key={p} onClick={() => setPage(p)}
                              className={`pagination-btn ${p === page ? 'active' : ''}`}>
                        {p + 1}
                      </button>
                    )
                  })}
                  <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}
                          className="pagination-btn disabled:opacity-40">
                    Next &rsaquo;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
