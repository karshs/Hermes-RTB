import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'

function timeRemaining(endTime) {
    const diff = new Date(endTime) - new Date()
    if (diff <= 0) return 'Ended'
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    if (hours > 24) return `${Math.floor(hours / 24)}d remaining`
    if (hours > 0) return `${hours}h ${mins}m remaining`
    return `${mins}m remaining`
}

function AuctionCard({ auction }) {
    const ended = new Date(auction.end_time) <= new Date()

    return (
        <Link
            to={`/auctions/${auction.id}`}
            className="block bg-[#1e293b] border border-white/10 rounded-xl p-5 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                        {auction.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">by {auction.seller}</p>
                </div>
                <span
                    className={`ml-3 shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ended
                            ? 'bg-slate-700 text-slate-400'
                            : 'bg-green-500/10 text-green-400'
                        }`}
                >
                    {!ended && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    )}
                    {ended ? 'Ended' : 'Live'}
                </span>
            </div>

            {/* Price */}
            <div className="mt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Current Price
                </p>
                <p className="text-xl font-bold text-white tracking-tight">
                    ₹{Number(auction.current_price).toLocaleString()}
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                <span>Started at ₹{Number(auction.start_price).toLocaleString()}</span>
                <span>⏱ {timeRemaining(auction.end_time)}</span>
            </div>
        </Link>
    )
}

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadAuctions = async () => {
        try {
            const res = await api.getAuctions()
            setAuctions(res.data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAuctions()
        // Refresh every 30 seconds
        const interval = setInterval(loadAuctions, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Navbar />

            <div className="max-w-5xl mx-auto px-8 py-10">
                {/* Page header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Live Auctions
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Browse and bid on active listings in real time
                        </p>
                    </div>
                    {!loading && !error && (
                        <span className="text-xs text-slate-500">
                            {auctions.length} active auction{auctions.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* States */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-[#1e293b] border border-white/10 rounded-xl p-5 animate-pulse"
                            >
                                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-white/5 rounded w-1/2 mb-6" />
                                <div className="h-6 bg-white/5 rounded w-1/3 mb-4" />
                                <div className="h-3 bg-white/5 rounded w-full" />
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="text-center py-20">
                        <p className="text-slate-400 text-sm">{error}</p>
                        <button
                            onClick={loadAuctions}
                            className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && auctions.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-white font-medium mb-2">No active auctions</p>
                        <p className="text-slate-400 text-sm mb-6">
                            Check back soon or create one yourself
                        </p>
                        <Link
                            to="/create"
                            className="inline-flex text-sm text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition-colors"
                        >
                            + Create Auction
                        </Link>
                    </div>
                )}

                {!loading && !error && auctions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {auctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
