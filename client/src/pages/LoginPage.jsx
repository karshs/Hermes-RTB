import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const [tab, setTab] = useState('login')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Login fields
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    // Register fields
    const [regUsername, setRegUsername] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPassword, setRegPassword] = useState('')

    const { login, register, user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || '/auctions'

    // Redirect if already logged in
    if (user) {
        navigate(from, { replace: true })
        return null
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        if (!loginEmail || !loginPassword) return setError('Please fill in all fields')
        setLoading(true)
        try {
            await login(loginEmail, loginPassword)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        if (!regUsername || !regEmail || !regPassword) return setError('Please fill in all fields')
        if (regPassword.length < 6) return setError('Password must be at least 6 characters')
        setLoading(true)
        try {
            await register(regUsername, regEmail, regPassword)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 h-14 border-b border-white/10">
                <Link to="/" className="text-white font-bold text-base tracking-tight">
                    Hermes-RTB
                </Link>
                <Link
                    to="/auctions"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    Browse Auctions
                </Link>
            </nav>

            {/* Card */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                            Welcome to Hermes-RTB
                        </h1>
                        <p className="text-sm text-slate-400">
                            Sign in to start bidding on live auctions
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 shadow-xl">
                        {/* Tabs */}
                        <div className="grid grid-cols-2 bg-[#0f172a] rounded-lg p-1 mb-6">
                            <button
                                onClick={() => { setTab('login'); setError('') }}
                                className={`py-2 text-sm font-medium rounded-md transition-all ${tab === 'login'
                                        ? 'bg-[#1e293b] text-white shadow'
                                        : 'text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => { setTab('register'); setError('') }}
                                className={`py-2 text-sm font-medium rounded-md transition-all ${tab === 'register'
                                        ? 'bg-[#1e293b] text-white shadow'
                                        : 'text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                Register
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Login Form */}
                        {tab === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors mt-2"
                                >
                                    {loading ? 'Signing in...' : 'Login'}
                                </button>
                            </form>
                        )}

                        {/* Register Form */}
                        {tab === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                        placeholder="yourname"
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors mt-2"
                                >
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-xs text-slate-600 mt-4">
                        New users start with ₹1,00,000 balance to bid with
                    </p>
                </div>
            </div>
        </div>
    )
}
