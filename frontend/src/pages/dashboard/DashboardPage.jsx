import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Package, Users, Wrench, AlertTriangle, TrendingDown,
  Activity, Building2, Shield, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { dashboardApi } from '../../api/index'
import useLanguageStore from '../../store/languageStore'
import { useTranslation } from '../../utils/translations'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import { CHART_COLORS } from '../../utils/constants'

// ─── Subcomponents ────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, change, prefix = '' }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div className={`stat-icon`} style={{ background: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="stat-value mt-1">{prefix}{formatNumber(value)}</div>
    <div className="stat-label">{label}</div>
  </div>
)

const SectionHeader = ({ title, subtitle }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2">
      <div className="w-0.5 h-4 rounded-full flex-shrink-0" style={{ background: '#8B0000' }} />
      <div>
        <h2 className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>{subtitle}</p>}
      </div>
    </div>
  </div>
)

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="skeleton h-10 w-10 rounded-xl" />
    <div className="skeleton h-7 w-20 rounded" />
    <div className="skeleton h-4 w-28 rounded" />
  </div>
)

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 shadow-lg text-sm">
      <p className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {formatNumber(p.value)}</p>
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { lang } = useLanguageStore()
  const t = useTranslation(lang)

  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then(r => r.data.data),
  })

  const { data: categoryChart } = useQuery({
    queryKey: ['dashboard', 'category'],
    queryFn: () => dashboardApi.getCategoryChart().then(r => r.data.data),
  })

  const { data: statusChart } = useQuery({
    queryKey: ['dashboard', 'status'],
    queryFn: () => dashboardApi.getStatusChart().then(r => r.data.data),
  })

  const { data: healthChart } = useQuery({
    queryKey: ['dashboard', 'health'],
    queryFn: () => dashboardApi.getHealthChart().then(r => r.data.data),
  })

  const { data: deptChart } = useQuery({
    queryKey: ['dashboard', 'department'],
    queryFn: () => dashboardApi.getDepartmentChart().then(r => r.data.data),
  })

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-6 rounded-full" style={{ background: '#8B0000' }} />
            <h1 className="page-title">{t("Operations Dashboard")}</h1>
          </div>
          <p className="page-subtitle pl-3">{t("Real-time overview of Indian Railways asset management system")}</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary btn-sm">
          <RefreshCw size={13} />
          {t("Refresh Data")}
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {statsLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : stats ? (
          <>
            <StatCard icon={Package} label={t("Total Assets")} value={stats.totalAssets} color="#6366f1" />
            <StatCard icon={Package} label={t("Available")} value={stats.availableAssets} color="#10b981" />
            <StatCard icon={Users} label={t("Assigned")} value={stats.assignedAssets} color="#3b82f6" />
            <StatCard icon={Wrench} label={t("Under Repair")} value={stats.underRepair} color="#f59e0b" />
            <StatCard icon={AlertTriangle} label={t("Warranty Expiring")} value={stats.warrantyExpiringIn30Days} color="#ef4444" />
            <StatCard icon={Building2} label={t("Total Employees")} value={stats.totalEmployees} color="#8b5cf6" />
            <StatCard icon={TrendingDown} label={t("Open Maintenance")} value={stats.openMaintenanceRequests} color="#ec4899" />
            <StatCard icon={Activity} label={t("High Risk Assets")} value={stats.highRiskAssets} color="#f97316" />
          </>
        ) : null}
      </div>

      {/* Financial Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 col-span-3 md:col-span-1">
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'rgb(var(--text-muted))' }}>{t("Total Purchase Value")}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'rgb(var(--text-primary))' }}>
              {formatCurrency(stats.totalPurchaseValue)}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'rgb(var(--text-muted))' }}>{t("Current Book Value")}</p>
            <p className="text-2xl font-bold mt-1 text-emerald-500">
              {formatCurrency(stats.totalCurrentValue)}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'rgb(var(--text-muted))' }}>{t("Total Depreciation")}</p>
            <p className="text-2xl font-bold mt-1 text-amber-500">
              {formatCurrency(stats.totalDepreciation)}
            </p>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Asset Status Pie */}
        <div className="card p-5">
          <SectionHeader title="Asset Status Distribution" />
          {statusChart ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%"
                     outerRadius={100} innerRadius={55} paddingAngle={3}>
                  {statusChart.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-64 rounded-xl" />
          )}
        </div>

        {/* Category Bar chart */}
        <div className="card p-5">
          <SectionHeader title="Assets by Category" />
          {categoryChart ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryChart} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border-color)/0.5)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} style={{ fill: 'rgb(var(--text-secondary))' }} />
                <YAxis tick={{ fontSize: 11 }} style={{ fill: 'rgb(var(--text-secondary))' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Assets" radius={[4, 4, 0, 0]}>
                  {categoryChart.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-64 rounded-xl" />
          )}
        </div>

        {/* Health Level Pie */}
        <div className="card p-5">
          <SectionHeader title="Asset Health Distribution" />
          {healthChart ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={healthChart} dataKey="value" nameKey="name" cx="50%" cy="50%"
                     outerRadius={100} innerRadius={55} paddingAngle={3}>
                  {healthChart.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-64 rounded-xl" />
          )}
        </div>

        {/* Department Distribution */}
        <div className="card p-5">
          <SectionHeader title="Assets by Department" />
          {deptChart ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptChart} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border-color)/0.5)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Assets" radius={[0, 4, 4, 0]} fill={CHART_COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-64 rounded-xl" />
          )}
        </div>
      </div>
    </div>
  )
}
