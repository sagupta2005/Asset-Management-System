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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

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

            {/* Feature list */}
            <div className="mt-10 space-y-3 text-left">
              {[
                { label: 'Comprehensive asset tracking and lifecycle management' },
                { label: 'Maintenance scheduling and warranty monitoring' },
                { label: 'AI-powered insights and budget forecasting' },
                { label: 'Role-based access control and audit logging' },
                { label: 'Real-time depreciation and valuation reports' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <ChevronRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#B8860B' }} />
                  <span className="text-sm" style={{ color: 'rgba(190,205,225,0.9)' }}>{f.label}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs" style={{ color: 'rgba(120,140,165,0.7)' }}>
              Confidential — For authorized personnel only
            </p>
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

              <div className="p-8">
                {/* Form header */}
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#8B0000' }}>
                      <Lock size={11} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Secure Sign-In</h2>
                  </div>
                  <p className="text-sm pl-7" style={{ color: 'rgba(140,160,185,0.9)' }}>
                    Authorized access only. All sessions are monitored and logged.
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
