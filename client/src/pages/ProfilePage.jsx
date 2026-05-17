import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function timeRemaining(endTime) {
    const diff = new Date(endTime) - new Date()
    if (diff <= 0) return 'Ended'
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    if (hours > 24) return `${Math.floor(hours / 24)}d remaining`
    if (hours > 0) return `${hours}h ${mins}m remaining`
    return `${mins}m remaining`
}

export default function ProfilePage() {
    const { user, updateUser } = useAuth()
    const [bids, setBids] = useState([])
    const [bidsLoading, setBidsLoading] = useState(true)
    const [topupLoading, setTopupLoading] = useState(false)
    const [topupMsg, setTopupMsg] = useState('')

    useEffect(() => {
        api.getMyBids()
            .then((res) => setBids(res.data))
            .catch(() => setBids([]))
            .finally(() => setBidsLoading(false))
    }, [])

    const handleTopUp = async () => {
        setTopupLoading(true)
        setTopupMsg('')
        try {
            const res = await api.topUp()
            updateUser(res.user)
            setTopupMsg('₹1,00,000 added successfully!')
            setTimeout(() => setTopupMsg(''), 3000)
        } catch (err) {
            setTopupMsg(err.message)
        } finally {
            setTopupLoading(false)
        }
    }

    const activeBids = bids.filter((b) => b.status === 'active')
    const endedBids = bids.filter((b) => b.status !== 'active')

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Navbar />

            <div className="max-w-4xl mx-auto px-8 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
                        My Profile
                    </h1>
                    <p className="text-sm text-slate-400">
                        Manage your account and track your bids
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    {/* LEFT — bid history */}
                    <div className="space-y-6">
                        {/* Active bids */}
                        <div>
                            <h2 className="text-sm font-semibold text-white mb-3">
                                Active Bids
                                {activeBids.length > 0 && (
                                    <span className="ml-2 text-xs text-slate-500 font-normal">
                                        {activeBids.length}
                                    </span>
                                )}
                            </h2>

                            {bidsLoading ? (
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : activeBids.length === 0 ? (
                                <div className="text-center py-10 border border-white/5 rounded-xl text-slate-500 text-sm">
                                    No active bids yet.{' '}
                                    <Link to="/auctions" className="text-blue-400 hover:text-blue-300">
                                        Browse auctions
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {activeBids.map((bid) => (
                                        <BidRow key={bid.id} bid={bid} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past bids */}
                        {!bidsLoading && endedBids.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-white mb-3">
                                    Past Bids
                                    <span className="ml-2 text-xs text-slate-500 font-normal">
                                        {endedBids.length}
                                    </span>
                                </h2>
                                <div className="space-y-2">
                                    {endedBids.map((bid) => (
                                        <BidRow key={bid.id} bid={bid} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT — account card */}
                    <div className="space-y-4">
                        {/* Account info */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                                Account
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Username</p>
                                    <p className="text-sm font-medium text-white">
                                        {user?.username}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Email</p>
                                    <p className="text-sm text-slate-300">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Balance card */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                                Balance
                            </p>
                            <p className="text-3xl font-bold text-white tracking-tight mb-1">
                                ₹{Number(user?.balance || 0).toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-slate-500 mb-4">
                                Available for bidding
                            </p>

                            {topupMsg && (
                                <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${topupMsg.includes('successfully')
                                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                    }`}>
                                    {topupMsg}
                                </div>
                            )}

                            <button
                                onClick={handleTopUp}
                                disabled={topupLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                            >
                                {topupLoading ? 'Adding...' : '+ Add ₹1,00,000'}
                            </button>
                            <p className="text-xs text-slate-600 text-center mt-2">
                                Demo top-up for testing
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                                Stats
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0f172a] rounded-lg p-3 text-center">
                                    <p className="text-xl font-bold text-white">{bids.length}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Total Bids</p>
                                </div>
                                <div className="bg-[#0f172a] rounded-lg p-3 text-center">
                                    <p className="text-xl font-bold text-blue-400">
                                        {bids.filter((b) => b.is_highest).length}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">Leading</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BidRow({ bid }) {
    const isHighest = bid.is_highest
    const ended = bid.status !== 'active'

    return (
        <Link
            to={`/auctions/${bid.auction_id}`}
            className="flex items-center justify-between bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 hover:border-blue-500/30 transition-colors group"
        >
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                    {bid.auction_title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                    {ended ? 'Ended' : timeRemaining(bid.end_time)}
                </p>
            </div>
            <div className="ml-4 text-right shrink-0">
                <p className="text-sm font-semibold text-white">
                    ₹{Number(bid.amount).toLocaleString('en-IN')}
                </p>
                <span className={`text-xs font-medium ${ended
                        ? 'text-slate-500'
                        : isHighest
                            ? 'text-green-400'
                            : 'text-yellow-400'
                    }`}>
                    {ended ? 'Ended' : isHighest ? '● Leading' : '○ Outbid'}
                </span>
            </div>
        </Link>
    )
}
