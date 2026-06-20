import axiosClient from './axiosClient'
import { demoAuth, fallbackOnNetworkError } from './mockData'

export const authApi = {
  // ── Authentication ──────────────────────────────────────────────────────────
  login:          (data) => {
    const isEmployee = data?.email && data.email.toLowerCase().includes('employee');
    const dynamicDemoAuth = {
      userId: isEmployee ? 2 : 1,
      email: data?.email || (isEmployee ? 'employee@company.com' : 'admin@company.com'),
      firstName: 'Demo',
      lastName: isEmployee ? 'Employee' : 'Admin',
      roles: isEmployee ? ['ROLE_EMPLOYEE'] : ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'],
      accessToken: isEmployee ? 'demo-access-token-employee' : 'demo-access-token-admin',
      refreshToken: isEmployee ? 'demo-refresh-token-employee' : 'demo-refresh-token-admin',
      department: isEmployee ? 'Operations' : 'IT',
    };
    return fallbackOnNetworkError(axiosClient.post('/auth/login', data), dynamicDemoAuth);
  },
  logout:         ()     => axiosClient.post('/auth/logout'),
  refreshToken:   (tok)  => axiosClient.post('/auth/refresh', { refreshToken: tok }),
  getProfile:     ()     => axiosClient.get('/auth/me'),
  updateProfile:  (data) => axiosClient.put('/auth/profile', data),

  // ── Registration ────────────────────────────────────────────────────────────
  register:       (data) => axiosClient.post('/auth/register', data),

  // ── OTP ─────────────────────────────────────────────────────────────────────
  /** Send OTP to the given email address */
  sendOtp:        (email)     => axiosClient.post('/auth/otp/send', { email }),
  /** Verify OTP — returns { token } on success for password reset flows */
  verifyOtp:      (email, otp) => axiosClient.post('/auth/otp/verify', { email, otp }),

  // ── Password ─────────────────────────────────────────────────────────────────
  forgotPassword: (email)               => axiosClient.post('/auth/forgot-password', { email }),
  resetPassword:  (token, newPassword)  => axiosClient.post('/auth/reset-password', { token, newPassword }),
  changePassword: (data)                => axiosClient.post('/auth/change-password', data),
}
