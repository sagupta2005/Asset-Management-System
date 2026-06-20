import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, LogIn, ChevronRight } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/authApi'
import useAuthStore from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/formatters'
import irLogo from '../../assets/images/indian_railways.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { success, error } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [portal, setPortal] = useState('admin') // 'admin' | 'employee'

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm()

  React.useEffect(() => {
    if (portal === 'admin') {
      setValue('email', 'admin@company.com')
      setValue('password', 'Admin@123')
    } else {
      setValue('email', 'employee@company.com')
      setValue('password', 'Emp@123')
    }
  }, [portal, setValue])

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const data = res.data?.data || res.data
      setAuth(data)
      success(`Welcome, ${data.firstName}!`)
      navigate('/dashboard')
    },
    onError: (err) => {
      error(getErrorMessage(err))
    }
  })

  const onSubmit = (data) => loginMutation.mutate(data)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0A1628 0%, #0D2044 50%, #0A1628 100%)' }}>

      {/* Top government header bar */}
      <div className="flex-shrink-0 px-6 py-2 flex items-center justify-between" style={{ background: 'rgba(139,0,0,0.9)', borderBottom: '1px solid rgba(184,134,11,0.4)' }}>
        <div className="text-xs text-white/80 font-medium tracking-wide">Government of India</div>
        <div className="text-xs text-white/80 font-medium tracking-wide">Ministry of Railways</div>
      </div>

      {/* Gold divider */}
      <div className="h-0.5 flex-shrink-0" style={{ background: 'linear-gradient(90deg, transparent, #B8860B, transparent)' }} />

      {/* Main content */}
      <div className="flex-1 flex">

        {/* Left Panel — Brand */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 relative">

          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #8B0000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 text-center max-w-lg">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full flex items-center justify-center p-1"
                style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(184,134,11,0.5)', boxShadow: '0 0 40px rgba(139,0,0,0.3)' }}>
                <img src={irLogo} alt="Indian Railways" className="w-full h-full object-contain rounded-full" />
              </div>
            </div>

            {/* Ministry Name */}
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: '#B8860B' }}>
              Ministry of Railways — Government of India
            </p>
            <h1 className="text-3xl font-bold text-white mb-1 leading-tight">
              Indian Railways
            </h1>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'rgba(200,215,235,0.9)' }}>
              Asset Management System
            </h2>
            <div className="h-0.5 w-24 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #B8860B, transparent)' }} />
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(160,178,205,0.85)' }}>
              A centralized digital platform for tracking, managing, and optimizing railway assets across all divisions and departments.
            </p>
            {/* Support Helpdesk */}
            <div className="mt-6 p-4 rounded-lg text-left" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold text-white mb-1 uppercase tracking-wide">IR-AMP System Helpdesk</p>
              <p className="text-xs text-slate-400">For access-related issues or system assistance, contact CRIS Support:</p>
              <div className="mt-2 flex flex-wrap gap-x-4 text-xs font-mono" style={{ color: '#B8860B' }}>
                <span>Email: support@cris.org.in</span>
                <span>Phone: 011-23301040</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical separator */}
        <div className="hidden lg:flex flex-col items-center justify-center">
          <div className="w-px h-3/4 rounded-full" style={{ background: 'linear-gradient(180deg, transparent, rgba(184,134,11,0.3), transparent)' }} />
        </div>

        {/* Right Panel — Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md animate-scale-in">

            {/* Mobile logo */}
            <div className="flex flex-col items-center mb-8 lg:hidden">
              <img src={irLogo} alt="Indian Railways" className="w-20 h-20 object-contain rounded-full mb-3"
                style={{ background: 'rgba(255,255,255,0.08)', padding: '4px', border: '1px solid rgba(184,134,11,0.4)' }} />
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#B8860B' }}>Indian Railways</p>
              <p className="text-white font-bold text-lg mt-0.5">Asset Management System</p>
            </div>

            {/* Card */}
            <div className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>

              {/* Card top accent */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #8B0000, #B8860B, #8B0000)' }} />

              {/* Portal Selector Tabs */}
              <div className="flex border-b border-white/10 bg-black/20">
                <button
                  type="button"
                  onClick={() => setPortal('admin')}
                  className={`flex-1 py-3.5 text-center font-bold text-sm transition-all duration-150 ${portal === 'admin' ? 'text-white border-b-2 border-[#B8860B] bg-white/5 font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/2'}`}
                >
                  Admin Portal
                </button>
                <button
                  type="button"
                  onClick={() => setPortal('employee')}
                  className={`flex-1 py-3.5 text-center font-bold text-sm transition-all duration-150 ${portal === 'employee' ? 'text-white border-b-2 border-[#B8860B] bg-white/5 font-extrabold' : 'text-slate-400 hover:text-white hover:bg-white/2'}`}
                >
                  Employee Portal
                </button>
              </div>

              <div className="p-8">
                {/* Form header */}
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#8B0000' }}>
                      <Lock size={11} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      Secure Sign-In — {portal === 'admin' ? 'Admin Portal' : 'Employee Portal'}
                    </h2>
                  </div>
                  <p className="text-sm pl-7" style={{ color: 'rgba(140,160,185,0.9)' }}>
                    {portal === 'admin'
                      ? 'Access administrative panels, allocations, audits, and analytical reports.'
                      : 'Access your assigned assets, declare returns, and check system notifications.'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                  {/* Employee ID / Email */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                      style={{ color: 'rgba(160,178,200,0.9)' }}>Employee ID / Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'rgba(140,160,185,0.6)' }} />
                      <input
                        id="login-email"
                        type="email"
                        placeholder="employee@indianrailways.gov.in"
                        {...register('email', {
                          required: 'Email address is required',
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email address' }
                        })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: `1px solid ${errors.email ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                          color: '#fff',
                        }}
                      />
                    </div>
                    {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                      style={{ color: 'rgba(160,178,200,0.9)' }}>Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'rgba(140,160,185,0.6)' }} />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters required' } })}
                        className="w-full pl-10 pr-10 py-2.5 rounded-md text-sm outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: `1px solid ${errors.password ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                          color: '#fff',
                        }}
                      />
                      <button
                        type="button"
                        id="toggle-password"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'rgba(140,160,185,0.6)' }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
                  </div>

                  {/* Forgot password */}
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-xs font-medium transition-colors hover:text-white"
                      style={{ color: '#B8860B' }}>
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <button
                    id="login-submit"
                    type="submit"
                    disabled={loginMutation.isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', boxShadow: '0 4px 14px rgba(139,0,0,0.45)', border: '1px solid rgba(139,0,0,0.5)' }}
                  >
                    {loginMutation.isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <>
                        <LogIn size={15} />
                        Sign In to System
                      </>
                    )}
                  </button>
                </form>

                {/* Demo credentials */}
                <div className="mt-6 p-4 rounded-md"
                  style={{ background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)' }}>
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#B8860B' }}>
                    Demo Access Credentials
                  </p>
                  <div className="space-y-1.5 text-xs" style={{ color: 'rgba(160,178,200,0.8)' }}>
                    <div className="flex justify-between">
                      <span className="font-medium text-white/60">Administrator:</span>
                      <span>admin@company.com / Admin@123</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-white/60">Employee:</span>
                      <span>employee@company.com / Emp@123</span>
                    </div>
                  </div>
                </div>

                {/* Register link */}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-center text-xs" style={{ color: 'rgba(140,160,185,0.7)' }}>
                    New employee?{' '}
                    <Link to="/register" className="font-semibold transition-colors hover:text-white"
                      style={{ color: '#B8860B' }}>
                      Register your account
                    </Link>
                  </p>
                </div>

                {/* Scrolling Notice Board / Circulars */}
                <div className="mt-5 pt-4 border-t border-white/10 text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#B8860B' }}>
                    <span className="w-1.5 h-3 bg-[#B8860B] rounded-sm" />
                    Latest Circulars & Notices
                  </h3>
                  <div className="h-24 overflow-hidden relative rounded-md border border-white/5 p-2 bg-black/45 backdrop-blur-sm">
                    <div className="animate-marquee space-y-2">
                      {[
                        { date: '15-Jun', text: 'Asset Condemnation & Disposal guidelines updated.' },
                        { date: '10-Jun', text: 'All zonal heads must upload physical verification reports.' },
                        { date: '02-Jun', text: 'Mandatory QR code tagging for rolling stock parts.' },
                        { date: '28-May', text: 'AI-based depreciation module integration completed.' },
                      ].map((notice, idx) => (
                        <div key={idx} className="text-[11px] border-b border-white/5 pb-1 flex items-start gap-1">
                          <span className="font-bold text-[9px] bg-red-950/70 text-red-400 px-1.5 py-0.5 rounded flex-shrink-0">{notice.date}</span>
                          <span className="truncate" style={{ color: 'rgba(200, 215, 235, 0.9)' }} title={notice.text}>{notice.text}</span>
                        </div>
                      ))}
                      {/* Duplicate for marquee continuous scroll */}
                      {[
                        { date: '15-Jun', text: 'Asset Condemnation & Disposal guidelines updated.' },
                        { date: '10-Jun', text: 'All zonal heads must upload physical verification reports.' },
                        { date: '02-Jun', text: 'Mandatory QR code tagging for rolling stock parts.' },
                        { date: '28-May', text: 'AI-based depreciation module integration completed.' },
                      ].map((notice, idx) => (
                        <div key={`dup-${idx}`} className="text-[11px] border-b border-white/5 pb-1 flex items-start gap-1">
                          <span className="font-bold text-[9px] bg-red-950/70 text-red-400 px-1.5 py-0.5 rounded flex-shrink-0">{notice.date}</span>
                          <span className="truncate" style={{ color: 'rgba(200, 215, 235, 0.9)' }} title={notice.text}>{notice.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs mt-5" style={{ color: 'rgba(100,120,145,0.7)' }}>
              Indian Railways Asset Management System &copy; {new Date().getFullYear()} | Government of India
            </p>
          </div>
        </div>
      </div>

      {/* Bottom government footer */}
      <div className="flex-shrink-0 px-6 py-2 text-center" style={{ background: 'rgba(10,22,40,0.8)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs" style={{ color: 'rgba(100,120,145,0.6)' }}>
          This system is for authorized Indian Railways personnel only. Unauthorized access is strictly prohibited.
        </p>
      </div>
    </div>
  )
}
