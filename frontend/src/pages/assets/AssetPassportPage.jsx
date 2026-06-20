import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, Shield, Wrench, Calendar, CreditCard, ArrowDownRight, Tag, Building2, User, MapPin, Printer } from 'lucide-react'
import { publicApi } from '../../api/index'
import { formatDate, formatCurrency, getStatusClass, formatStatus } from '../../utils/formatters'

export default function AssetPassportPage() {
  const { assetTag } = useParams()

  const { data: passport, isLoading, error } = useQuery({
    queryKey: ['assetPassport', assetTag],
    queryFn: () => publicApi.getPassport(assetTag).then(r => r.data?.data || r),
    enabled: !!assetTag,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <div className="h-12 w-48 bg-slate-800 rounded animate-pulse mx-auto" />
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 animate-pulse">
            <div className="h-6 w-32 bg-slate-800 rounded mx-auto" />
            <div className="h-4 w-48 bg-slate-800 rounded mx-auto" />
            <div className="h-32 bg-slate-800 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !passport || !passport.asset) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center border border-red-900 bg-red-950/20">
          <p className="text-sm font-medium text-red-400">Asset passport information not found or inaccessible.</p>
          <p className="text-xs text-slate-400 mt-2">Please ensure the QR code scanned contains a valid Asset Tag.</p>
        </div>
      </div>
    )
  }

  const { asset, allocations = [], maintenance = [], warranty, depreciation = [] } = passport

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full bg-red-800" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">INDIAN RAILWAYS AMS</h1>
              <p className="text-xs text-slate-400">Official Device Verification & Digital Passport</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <Printer size={14} /> Print Passport
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Info Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center shadow-xl">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-850 border border-slate-800">
                <Package size={44} className="text-red-500" />
              </div>
              <h2 className="text-base font-bold text-white leading-tight">{asset.name}</h2>
              <p className="text-xs text-slate-400 mt-1">{asset.brand} {asset.model}</p>

              <div className="flex flex-col gap-2 mt-4">
                <div className="px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                  Tag: {asset.assetTag}
                </div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(asset.status)}`}>
                    {formatStatus(asset.status)}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800 mt-5 pt-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Department</span>
                  <span className="font-semibold text-slate-200">{asset.departmentName || 'General'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Assigned To</span>
                  <span className="font-semibold text-slate-200">{asset.assignedToName || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Location</span>
                  <span className="font-semibold text-slate-200">{asset.location || '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Serial No.</span>
                  <span className="font-semibold text-slate-200 font-mono">{asset.serialNumber || '—'}</span>
                </div>
              </div>
            </div>

            {/* Financials & Warranty Overview */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <Shield size={14} className="text-red-500" /> Warranty & Cost
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Purchase Price</span>
                  <span className="font-semibold text-white">{formatCurrency(asset.purchaseCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Purchase Date</span>
                  <span className="text-slate-200">{formatDate(asset.purchaseDate) || '—'}</span>
                </div>
                {warranty && (
                  <>
                    <div className="border-t border-slate-800 my-2 pt-2" />
                    <div className="flex justify-between">
                      <span className="text-slate-400">Warranty Contract</span>
                      <span className="text-slate-200 font-mono">{warranty.contractNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Warranty Expiry</span>
                      <span className="text-red-400 font-medium">{formatDate(warranty.endDate) || '—'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Timelines / History Tabs */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Allocation History */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <User size={16} className="text-red-500" /> Allocation History
              </h3>
              {allocations.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No allocation history logged for this device.</p>
              ) : (
                <div className="space-y-3">
                  {allocations.map((alloc, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-slate-200">{alloc.employeeName || 'Unknown Employee'}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">{alloc.departmentName || 'General'}</p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-success px-2 py-0.5 text-[10px]">Active</span>
                        <p className="text-[10px] text-slate-400 mt-1">Assigned: {formatDate(alloc.allocationDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Maintenance History */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar size={16} className="text-red-500" /> Maintenance Logs
              </h3>
              {maintenance.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No maintenance jobs recorded for this device.</p>
              ) : (
                <div className="space-y-3">
                  {maintenance.map((maint, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-200">{maint.issueDescription}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Performed by {maint.vendorName || 'Technical Staff'}</p>
                        </div>
                        <span className="badge badge-info px-2 py-0.5 text-[10px]">
                          {maint.status || 'Completed'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-850/60 pt-2">
                        <span>Cost: {formatCurrency(maint.cost)}</span>
                        <span>Date: {formatDate(maint.completionDate || maint.startDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Depreciation Ledger */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowDownRight size={16} className="text-red-500" /> Depreciation Ledger
              </h3>
              {depreciation.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No depreciation records available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">Year</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2 text-right">Depreciation</th>
                        <th className="pb-2 text-right">Remaining Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {depreciation.map((dep, idx) => (
                        <tr key={idx} className="text-slate-300">
                          <td className="py-2.5">{dep.year}</td>
                          <td className="py-2.5">{dep.method || 'Straight Line'}</td>
                          <td className="py-2.5 text-right text-red-400">{formatCurrency(dep.depreciationValue)}</td>
                          <td className="py-2.5 text-right font-medium text-emerald-400">{formatCurrency(dep.bookValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-500 border-t border-slate-900 pt-6">
          This digital device passport is generated by the Indian Railways Asset Management System (AMS). Contains verified details of public assets.
        </div>
      </div>
    </div>
  )
}
