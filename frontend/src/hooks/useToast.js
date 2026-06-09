import { useCallback } from 'react'
import toast from 'react-hot-toast'

/**
 * Toast notification hook.
 * No emoji — uses react-hot-toast with custom IR styling applied via App.jsx toastOptions.
 */
export const useToast = () => {
  const success = useCallback((msg) => toast.success(msg, { duration: 3500 }), [])
  const error   = useCallback((msg) => toast.error(msg,   { duration: 5000 }), [])
  const info    = useCallback((msg) => toast(msg, {
    duration: 3500,
    icon: null,
    style: { borderLeft: '3px solid #1A3A6B' },
  }), [])
  const loading = useCallback((msg) => toast.loading(msg), [])
  const dismiss = useCallback((id) => toast.dismiss(id), [])
  return { success, error, info, loading, dismiss }
}
