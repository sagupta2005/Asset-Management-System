import axiosClient from './axiosClient'
import { demoAuth, fallbackOnNetworkError } from './mockData'

export const authApi = {
  // ── Authentication ──────────────────────────────────────────────────────────
  login:          (data) => fallbackOnNetworkError(axiosClient.post('/auth/login', data), demoAuth),
  logout:         ()     => axiosClient.post('/auth/logout'),
  refreshToken:   (tok)  => axiosClient.post('/auth/refresh', { refreshToken: tok }),
  getProfile:     ()     => axiosClient.get('/auth/me'),

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
