import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, StopCircle, CheckCircle2, Eye, GitBranch, RotateCcw, Wrench, AlertTriangle } from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/formatters'

// ─── How it works steps ───────────────────────────────────────────────────────
const steps = [
  'Click on "Scan Camera" button',
  'Allow camera access',
  'Point camera to QR Code',
  'Asset details will appear automatically',
]

// ─── Scan Result overlay ──────────────────────────────────────────────────────
function ScanResult({ asset, onClose }) {
  const navigate = useNavigate()

  return (
    <div className="animate-scale-in">
      {/* Success banner */}
      <div className="rounded-xl p-4 mb-5 flex items-center gap-3"
           style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)' }}>
        <CheckCircle2 size={28} className="text-green-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm text-green-700">QR Code Scanned Successfully!</p>
          <p className="text-xs text-green-600 mt-0.5">Asset ID: {asset.assetTag || `#${asset.id}`}</p>
        </div>
      </div>

      {/* Asset info grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="col-span-2 flex items-start gap-4 p-4 rounded-xl"
             style={{ background: 'rgb(var(--bg-elevated))' }}>
          {/* Placeholder image */}
          <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'var(--ams-blue-pale)' }}>
            <span style={{ fontSize: '2rem' }}>💻</span>
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'rgb(var(--text-primary))' }}>
              {asset.name}
            </h2>
            {[
              ['Asset Name', asset.name],
              ['Category',   asset.categoryName],
              ['Serial No.', asset.serialNumber],
              ['Status',     asset.status],
              ['Assigned To', asset.assignedToName],
              ['Location',   asset.location],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2 text-xs mt-1">
                <span style={{ color: 'rgb(var(--text-muted))', minWidth: '80px' }}>{k}:</span>
                <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => navigate(`/assets/${asset.id}`)}
          className="btn-primary btn-sm flex-col py-3 gap-1"
        >
          <Eye size={16} />
          <span className="text-xs">View Details</span>
        </button>
        <button className="btn-secondary btn-sm flex-col py-3 gap-1">
          <GitBranch size={16} />
          <span className="text-xs">Assign Asset</span>
        </button>
        <button className="btn-secondary btn-sm flex-col py-3 gap-1">
          <RotateCcw size={16} />
          <span className="text-xs">Return Asset</span>
        </button>
        <button className="btn-secondary btn-sm flex-col py-3 gap-1">
          <Wrench size={16} />
          <span className="text-xs">Maintenance</span>
        </button>
      </div>

      {/* Scan again */}
      <button onClick={onClose} className="w-full btn-secondary btn-sm mt-4">
        Scan Another QR Code
      </button>
    </div>
  )
}

// ─── Main QR Scanner Page ─────────────────────────────────────────────────────
export default function QrScannerPage() {
  const { success, error } = useToast()
  const [scanning, setScanning]     = useState(false)
  const [scannedAsset, setScannedAsset] = useState(null)
  const [stream, setStream]         = useState(null)
  const videoRef = useRef(null)

  // Start camera
  const startScan = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(mediaStream)
      setScanning(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
    } catch (e) {
      error('Camera access denied. Please allow camera permissions.')
    }
  }

  // Stop camera
  const stopScan = () => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setScanning(false)
  }

  // Clean up on unmount
  useEffect(() => () => stream?.getTracks().forEach(t => t.stop()), [stream])

  // Simulate a scan after 3s (demo: replace with real QR decode library)
  useEffect(() => {
    if (!scanning) return
    const timer = setTimeout(async () => {
      // In production: use jsQR or html5-qrcode
      // Here we simulate a lookup:
      try {
        // Demo: comment this out when real QR decoding is added
        // const res = await qrApi.scan('DEMO-TAG-001')
        // setScannedAsset(res.data.data)
      } catch (e) {
        error(getErrorMessage(e))
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [scanning])

  const handleReset = () => {
    stopScan()
    setScannedAsset(null)
  }

  return (
    <div className="animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">QR Code Scanner</h1>
          <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
            Dashboard &rsaquo; <span style={{ color: 'var(--ams-blue-mid)' }}>QR Code Scanner</span>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Camera / Result Panel ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgb(var(--border-color))' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                {scannedAsset ? 'Scan Result' : 'Scan Asset QR Code'}
              </h2>
            </div>
            <div className="p-5">
              {scannedAsset ? (
                <ScanResult asset={scannedAsset} onClose={handleReset} />
              ) : (
                <>
                  {/* Viewfinder */}
                  <div className="qr-viewfinder mb-4">
                    {scanning ? (
                      <>
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          playsInline muted
                        />
                        {/* QR corner brackets */}
                        <div className="qr-corner qr-corner-tl" />
                        <div className="qr-corner qr-corner-tr" />
                        <div className="qr-corner qr-corner-bl" />
                        <div className="qr-corner qr-corner-br" />
                        {/* Scan line */}
                        <div className="qr-scan-line" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4"
                           style={{ background: '#111827' }}>
                        <Camera size={52} className="text-gray-500" />
                        <p className="text-gray-400 text-sm">Camera is off</p>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center gap-3">
                    {scanning ? (
                      <button onClick={stopScan} className="btn-danger">
                        <StopCircle size={16} /> Stop Camera
                      </button>
                    ) : (
                      <button onClick={startScan} className="btn-primary">
                        <Camera size={16} /> Scan Camera
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
              How It Works
            </h3>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--ams-blue-mid)' }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm pt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-6 p-3 rounded-xl"
                 style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-sky-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-sky-600">Tips</p>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Ensure good lighting. Hold the camera steady 10–20 cm from the QR code.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status card */}
          <div className="card p-5 mt-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>
              Scanner Status
            </h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${scanning ? 'animate-pulse-ring' : ''}`}
                   style={{ background: scanning ? '#22c55e' : '#94a3b8' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                  {scanning ? 'Camera Active' : 'Camera Idle'}
                </p>
                <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                  {scanning ? 'Scanning for QR codes...' : 'Click Scan Camera to begin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
