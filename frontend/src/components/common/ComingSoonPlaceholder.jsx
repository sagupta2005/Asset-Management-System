import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  ArrowRight,
  Vote,
  Compass,
  Mail,
  CheckCircle2,
  Terminal,
  Layers,
  ChevronRight,
  DollarSign,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Tag,
  Plus,
  Trash2,
  ListTodo
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ComingSoonPlaceholder({ title }) {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [votes, setVotes] = useState({})
  const [loading, setLoading] = useState(false)

  // Sandbox states
  const [sandboxCategories, setSandboxCategories] = useState([
    { id: 1, name: 'Rolling Stock', code: 'RS-AMS', count: 124 },
    { id: 2, name: 'Signaling Equipment', code: 'SIG-AMS', count: 48 },
    { id: 3, name: 'Track Components', code: 'TRK-AMS', count: 215 },
  ])
  const [newCatName, setNewCatName] = useState('')
  const [budgetInflation, setBudgetInflation] = useState(4)
  const [budgetLifespan, setBudgetLifespan] = useState(8)
  const [terminalLogs, setTerminalLogs] = useState([
    'SYSTEM: Initializing Audit Sync Service...',
    'AUDIT: User Admin requested login from 192.168.1.105',
    'AUDIT: Asset #AMS-DL-9824 allocated to Division NE-3',
  ])
  const [terminalInput, setTerminalInput] = useState('')

  // Poll features
  const pollFeatures = {
    'Asset Categories': [
      'Hierarchical sub-categories',
      'Bulk category import/export via CSV',
      'AI-based automatic tagging recommendation',
    ],
    'Budget Forecasting': [
      'Machine learning depreciation forecasting',
      'Multi-division budget allocation planning',
      'Automated renewal recommendation reports',
    ],
    'Asset Returns': [
      'Digital signature integration for handovers',
      'Automatic condition grading on return',
      'Automated email notification to original custodian',
    ],
    'Audit Logs': [
      'Export to secure blockchain-anchored ledger',
      'Granular search by IP address & API route',
      'Real-time Slack / Teams audit notifications',
    ],
    'default': [
      'Excel integration & scheduled reports',
      'Custom alert thresholds & email alerts',
      'Mobile scanner integration support',
    ]
  }

  const activeFeatures = pollFeatures[title] || pollFeatures['default']

  useEffect(() => {
    // Load existing votes
    const savedVotes = localStorage.getItem(`votes_${title}`)
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes))
    } else {
      // Init mock votes
      const initial = {}
      activeFeatures.forEach((feat, idx) => {
        initial[feat] = Math.floor(Math.random() * 25) + 10
      })
      setVotes(initial)
    }
  }, [title])

  const handleVote = (feat) => {
    const updated = {
      ...votes,
      [feat]: (votes[feat] || 0) + 1
    }
    setVotes(updated)
    localStorage.setItem(`votes_${title}`, JSON.stringify(updated))
    toast.success('Vote submitted successfully!')
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setIsSubscribed(true)
      toast.success(`Registered successfully!`)
    }, 800)
  }

  // Interactive Sandbox Event Handlers
  const addCategory = (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    const newCat = {
      id: Date.now(),
      name: newCatName,
      code: `${newCatName.toUpperCase().slice(0, 3)}-AMS`,
      count: 0
    }
    setSandboxCategories([...sandboxCategories, newCat])
    setNewCatName('')
    toast.success('Simulated category added!')
  }

  const deleteCategory = (id) => {
    setSandboxCategories(sandboxCategories.filter(c => c.id !== id))
    toast.success('Simulated category removed!')
  }

  const submitTerminalCommand = (e) => {
    e.preventDefault()
    if (!terminalInput.trim()) return
    const newLog = `USER@AMS:~$ ${terminalInput}`
    let response = `bash: command not found: ${terminalInput}`
    if (terminalInput.toLowerCase().includes('help')) {
      response = 'Available commands: ls, get-logs, status, clear'
    } else if (terminalInput.toLowerCase().includes('status')) {
      response = 'STATUS: Security ledger active. 0 errors detected.'
    } else if (terminalInput.toLowerCase().includes('ls')) {
      response = 'audit_events_2026.csv   syslog.log   users.json'
    } else if (terminalInput.toLowerCase().includes('get-logs')) {
      response = 'AUDIT: 12 events loaded from db.'
    } else if (terminalInput.toLowerCase().includes('clear')) {
      setTerminalLogs([])
      setTerminalInput('')
      return
    }
    setTerminalLogs(prev => [...prev, newLog, response])
    setTerminalInput('')
  }

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="animate-fade-in space-y-6">
      {/* ─── Premium Header Card ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
           style={{
             background: 'linear-gradient(135deg, rgb(var(--bg-surface)) 0%, rgba(var(--bg-elevated), 0.7) 100%)',
             borderColor: 'rgb(var(--border-color))'
           }}>
        {/* Abstract absolute background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
             style={{ background: 'var(--ams-blue-mid)' }} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                 style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--ams-blue-light)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <Sparkles size={12} className="animate-pulse" />
              Indian Railways AMS Roadmap
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight"
                style={{ color: 'rgb(var(--text-primary))' }}>
              {title}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
              The backend architecture and DB tables for this module are deployed. We are crafting the final React components to match Indian Railways operations standards.
            </p>
          </div>

          <div className="flex-shrink-0">
            {isSubscribed ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <CheckCircle2 size={16} />
                <span>Subscribed for updates!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-muted))' }} />
                  <input
                    type="email"
                    required
                    placeholder="Enter email to get notified"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input pl-9 w-60 h-10 text-xs"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary h-10 text-xs px-4">
                  {loading ? 'Subscribing...' : 'Notify Me'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── Grid: Interactive Sandbox + Features & Roadmap ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ── Column 1: Feature Simulator Sandbox ───────────────────────────── */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Compass size={18} className="text-amber-500" />
              <h2 className="text-base font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                Module Sandbox Simulator
              </h2>
            </div>

            {/* Sandbox Case 1: Categories */}
            {title === 'Asset Categories' && (
              <div className="space-y-4">
                <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Preview how category distribution is managed. Create or remove test categories.
                </p>
                <form onSubmit={addCategory} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signaling Systems"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="input h-9 text-xs py-1"
                  />
                  <button type="submit" className="btn-secondary h-9 text-xs px-3 inline-flex items-center gap-1">
                    <Plus size={14} /> Add
                  </button>
                </form>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {sandboxCategories.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg border text-xs"
                         style={{ background: 'rgb(var(--bg-elevated))', borderColor: 'rgb(var(--border-color))' }}>
                      <div>
                        <span className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{c.name}</span>
                        <span className="ml-2 font-mono text-[10px]" style={{ color: 'rgb(var(--text-muted))' }}>{c.code}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge badge-gray">{c.count} items</span>
                        <button onClick={() => deleteCategory(c.id)} className="text-red-400 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sandbox Case 2: Budget Forecasting */}
            {title === 'Budget Forecasting' && (
              <div className="space-y-4">
                <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Simulate dynamic budget parameters to preview cost-saving calculations.
                </p>
                <div className="space-y-3 p-3 rounded-xl border bg-elevated" style={{ borderColor: 'rgb(var(--border-color))' }}>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'rgb(var(--text-secondary))' }}>Inflation Rate</span>
                      <span className="font-bold text-amber-500">{budgetInflation}%</span>
                    </div>
                    <input
                      type="range" min="1" max="15" value={budgetInflation}
                      onChange={e => setBudgetInflation(Number(e.target.value))}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                      style={{ background: 'rgb(var(--border-color))' }}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'rgb(var(--text-secondary))' }}>Target Asset Lifespan Extension</span>
                      <span className="font-bold text-emerald-500">{budgetLifespan} Years</span>
                    </div>
                    <input
                      type="range" min="1" max="20" value={budgetLifespan}
                      onChange={e => setBudgetLifespan(Number(e.target.value))}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                      style={{ background: 'rgb(var(--border-color))' }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg flex items-center justify-between text-xs"
                     style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-500 animate-bounce" />
                    <div>
                      <p className="font-semibold text-emerald-400">Projected Savings</p>
                      <p className="text-[10px]" style={{ color: 'rgb(var(--text-muted))' }}>Based on active asset lifespan extension policy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-emerald-500">
                      ₹{((budgetLifespan * 1.85) - (budgetInflation * 0.2)).toFixed(2)} Cr
                    </p>
                    <p className="text-[9px]" style={{ color: 'rgb(var(--text-muted))' }}>Next 5 Years</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sandbox Case 3: Audit Logs / Terminal console */}
            {title === 'Audit Logs' && (
              <div className="space-y-3">
                <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Simulated terminal sandbox for raw audit logs. Try typing <code>help</code>, <code>ls</code>, <code>status</code>.
                </p>
                <div className="bg-black/85 text-emerald-400 p-3 rounded-xl font-mono text-xs h-36 overflow-y-auto space-y-1">
                  {terminalLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
                <form onSubmit={submitTerminalCommand} className="flex gap-2">
                  <div className="relative flex-1">
                    <Terminal size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Type command..."
                      value={terminalInput}
                      onChange={e => setTerminalInput(e.target.value)}
                      className="input pl-9 h-8 text-xs py-1 font-mono"
                    />
                  </div>
                  <button type="submit" className="btn-secondary h-8 text-xs px-3">Run</button>
                </form>
              </div>
            )}

            {/* Default Sandbox widget (generic placeholder feature checklist) */}
            {['Asset Categories', 'Budget Forecasting', 'Audit Logs'].indexOf(title) === -1 && (
              <div className="space-y-4">
                <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                  This module's interface is undergoing rapid prototyping. Explore upcoming layout tabs below:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Overview Grid', done: true },
                    { label: 'Dynamic Reports', done: true },
                    { label: 'API Connectors', done: true },
                    { label: 'Multi-Role Sync', done: false },
                  ].map((x, i) => (
                    <div key={i} className="p-3 rounded-lg border text-xs flex items-center justify-between"
                         style={{ background: 'rgb(var(--bg-elevated))', borderColor: 'rgb(var(--border-color))' }}>
                      <span style={{ color: 'rgb(var(--text-primary))' }}>{x.label}</span>
                      <span className={`text-[10px] font-semibold ${x.done ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {x.done ? 'Scaffolded' : 'Configuring'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl border text-xs" style={{ borderColor: 'rgb(var(--border-color))', background: 'rgb(var(--bg-surface))' }}>
                  <p className="font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'rgb(var(--text-primary))' }}>
                    <ListTodo size={14} className="text-indigo-400" /> Prototyping Checklist
                  </p>
                  <ul className="space-y-1.5 text-[11px]" style={{ color: 'rgb(var(--text-secondary))' }}>
                    <li className="flex items-center gap-1.5">✓ Database structural migration successful</li>
                    <li className="flex items-center gap-1.5">✓ Controller routes and Swagger API docs linked</li>
                    <li className="flex items-center gap-1.5">⏱ Designing high-fidelity tailwind dashboard view</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t mt-4 flex items-center justify-between text-[11px]" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <span style={{ color: 'rgb(var(--text-muted))' }}>Simulation is stateful in-memory.</span>
            <span className="font-bold cursor-pointer hover:underline text-indigo-400 flex items-center gap-0.5">
              Read docs <ChevronRight size={10} />
            </span>
          </div>
        </div>

        {/* ── Column 2: Live Feature Poll ───────────────────────────────────── */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Vote size={18} className="text-indigo-500" />
              <h2 className="text-base font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                Vote For Target Features
              </h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
              We prioritize release schedules based on system administrator votes. Select features you want first.
            </p>

            <div className="space-y-3.5">
              {activeFeatures.map((feat) => {
                const count = votes[feat] || 0
                const percent = Math.round((count / totalVotes) * 100)
                return (
                  <div key={feat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{feat}</span>
                      <span className="font-bold text-indigo-400">{percent}% ({count})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgb(var(--bg-elevated))' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                             style={{
                               width: `${percent}%`,
                               background: 'linear-gradient(90deg, var(--ams-blue-mid) 0%, var(--ams-accent) 100%)'
                             }} />
                      </div>
                      <button onClick={() => handleVote(feat)}
                              className="btn-secondary py-1 px-2.5 text-[10px] rounded-md h-7 hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-1">
                        +1 Vote
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t pt-4 mt-6" style={{ borderColor: 'rgb(var(--border-color))' }}>
            {/* Phase roadmap timeline */}
            <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-center">
              {[
                { phase: 'DB Setup', current: true, label: 'Done' },
                { phase: 'API Scaffold', current: true, label: 'Done' },
                { phase: 'UI Layout', current: false, label: 'Active' },
                { phase: 'Beta QA', current: false, label: 'Next' }
              ].map((x, idx) => (
                <div key={idx} className="flex-1 space-y-1">
                  <div className="h-1 rounded-full"
                       style={{ background: x.current ? 'var(--ams-blue-light)' : 'rgb(var(--border-color))' }} />
                  <p style={{ color: x.current ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))' }}>{x.phase}</p>
                  <p className="text-[9px] font-medium" style={{ color: x.current ? 'var(--ams-blue-light)' : 'rgb(var(--text-muted))' }}>{x.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
