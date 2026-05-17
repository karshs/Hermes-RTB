import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function useCountdown(endTime) {
    const [remaining, setRemaining] = useState('')
    const [urgent, setUrgent] = useState(false)

    useEffect(() => {
        const tick = () => {
            const diff = new Date(endTime) - new Date()
            if (diff <= 0) {
                setRemaining('Auction ended')
                setUrgent(false)
                return
            }
            const days = Math.floor(diff / 86400000)
            const hours = Math.floor((diff % 86400000) / 3600000)
            const mins = Math.floor((diff % 3600000) / 60000)
            const secs = Math.floor((diff % 60000) / 1000)
            setUrgent(diff < 3600000)
            if (days > 0) setRemaining(`${days}d ${hours}h remaining`)
            else if (hours > 0) setRemaining(`${hours}h ${mins}m remaining`)
            else setRemaining(`${mins}m ${secs}s remaining`)
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [endTime])

    return { remaining, urgent }
}

function BidItem({ amount, bidder, time, isTop }) {
    return (
        <div
            className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm animate-[slideIn_0.3s_ease] ${isTop
                    ? 'border-blue-500/40 bg-blue-500/5'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
        >
            <div>
                <span className={`font-semibold ${isTop ? 'text-blue-400' : 'text-white'}`}>
                    ₹{Number(amount).toLocaleString()}
                </span>
                <span className="text-slate-500 ml-2">by {bidder}</span>
            </div>
            <span className="text-xs text-slate-600">
                {new Date(time).toLocaleTimeString()}
            </span>
        </div>
    )
}

export default function AuctionDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [auction, setAuction] = useState(null)
    const [bids, setBids] = useState([])
    const [currentPrice, setCurrentPrice] = useState(0)
    const [highestBidder, setHighestBidder] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Bid form
    const [bidAmount, setBidAmount] = useState('')
    const [bidLoading, setBidLoading] = useState(false)
    const [bidError, setBidError] = useState('')
    const [bidSuccess, setBidSuccess] = useState('')

    // Price flash animation
    const [priceFlash, setPriceFlash] = useState(false)
    const priceRef = useRef(currentPrice)

    const { remaining, urgent } = useCountdown(auction?.end_time || new Date())

    const flashPrice = (price, bidder) => {
        setCurrentPrice(Number(price))
        setHighestBidder(bidder || '')
        setPriceFlash(true)
        setTimeout(() => setPriceFlash(false), 1000)
    }

    useEffect(() => {
        if (!id) { navigate('/auctions'); return }

        api.getAuction(id)
            .then((res) => {
                const a = res.data
                setAuction(a)
                setCurrentPrice(Number(a.current_price))
                if (a.highest_bid) {
                    setHighestBidder(a.highest_bid.bidder)
                    setBids([{
                        amount: a.highest_bid.amount,
                        bidder: a.highest_bid.bidder,
                        time: new Date(),
                        isTop: true,
                    }])
                }
            })
            .catch(() => setError('Failed to load auction'))
            .finally(() => setLoading(false))
    }, [id, navigate])

    // Keep priceRef in sync for bid validation
    useEffect(() => { priceRef.current = currentPrice }, [currentPrice])

    const isEnded = auction ? new Date(auction.end_time) <= new Date() : false
    const canBid = user && auction?.status === 'active' && !isEnded

    const handleBid = async (e) => {
        e.preventDefault()
        setBidError('')
        setBidSuccess('')
        const amount = parseFloat(bidAmount)
        if (!amount || amount <= priceRef.current) {
            setBidError(`Bid must be higher than ₹${priceRef.current.toLocaleString()}`)
            return
        }
        setBidLoading(true)
        try {
            await api.placeBid(id, amount)
            setBidAmount('')
            setBidSuccess('Bid placed successfully!')
            setTimeout(() => setBidSuccess(''), 3000)
            // Optimistically update price
            flashPrice(amount, user.username)
            setBids((prev) => [
                { amount, bidder: user.username, time: new Date(), isTop: true },
                ...prev.map((b) => ({ ...b, isTop: false })),
            ])
        } catch (err) {
            setBidError(err.message)
        } finally {
            setBidLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a]">
                <Navbar />
                <div className="max-w-5xl mx-auto px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                        <div className="space-y-4">
                            <div className="h-8 bg-white/5 rounded w-2/3 animate-pulse" />
                            <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse" />
                            <div className="h-24 bg-white/5 rounded animate-pulse" />
                        </div>
                        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !auction) {
        return (
            <div className="min-h-screen bg-[#0f172a]">
                <Navbar />
                <div className="flex items-center justify-center py-32 text-slate-400 text-sm">
                    {error || 'Auction not found'}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Navbar />

            <div className="max-w-5xl mx-auto px-8 py-10">
                {/* Back link */}
                <Link
                    to="/auctions"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6"
                >
                    ← All Auctions
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    {/* LEFT — main content */}
                    <div>
                        {/* Title + meta */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isEnded
                                            ? 'bg-slate-700 text-slate-400'
                                            : 'bg-green-500/10 text-green-400'
                                        }`}
                                >
                                    {!isEnded && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    )}
                                    {isEnded ? 'Ended' : 'Live'}
                                </span>
                                <span className="text-xs text-slate-500">
                                    Listed by <span className="text-slate-300">{auction.seller}</span>
                                </span>
                                <span className="text-xs text-slate-600">
                                    {new Date(auction.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                {auction.title}
                            </h1>
                        </div>

                        {/* Description */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 mb-6">
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {auction.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Bid history */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3">
                                Bid History
                            </h3>
                            {bids.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 text-sm border border-white/5 rounded-xl">
                                    No bids yet — be the first!
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {bids.map((bid, i) => (
                                        <BidItem key={i} {...bid} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT — sticky sidebar */}
                    <div className="lg:sticky lg:top-20 h-fit">
                        {/* Live indicator */}
                        {!isEnded && (
                            <div className="flex items-center gap-2 text-xs text-green-400 mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Live updates enabled
                            </div>
                        )}

                        {/* Price card */}
                        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                                Current Price
                            </p>
                            <p
                                className={`text-4xl font-bold tracking-tight mb-1 transition-colors duration-300 ${priceFlash ? 'text-blue-400' : 'text-white'
                                    }`}
                            >
                                ₹{currentPrice.toLocaleString()}
                            </p>
                            {highestBidder && (
                                <p className="text-xs text-slate-500 mb-4">
                                    Highest bid by{' '}
                                    <span className="text-slate-300">{highestBidder}</span>
                                </p>
                            )}

                            {/* Timer */}
                            <div
                                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-4 ${urgent
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        : 'bg-white/5 border border-white/5 text-slate-400'
                                    }`}
                            >
                                ⏱ {remaining}
                            </div>

                            {/* Bid section */}
                            {isEnded || auction.status !== 'active' ? (
                                <div className="text-center py-3 text-slate-500 text-sm">
                                    This auction has ended
                                </div>
                            ) : !user ? (
                                <div className="text-center py-3 text-sm text-slate-400">
                                    <Link to="/login" className="text-blue-400 hover:text-blue-300">
                                        Login
                                    </Link>{' '}
                                    to place a bid
                                </div>
                            ) : (
                                <form onSubmit={handleBid} className="space-y-3">
                                    {bidError && (
                                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                            {bidError}
                                        </div>
                                    )}
                                    {bidSuccess && (
                                        <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                                            {bidSuccess}
                                        </div>
                                    )}
                                    <input
                                        type="number"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        placeholder={`More than ₹${currentPrice.toLocaleString()}`}
                                        min={currentPrice + 1}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={bidLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                                    >
                                        {bidLoading ? 'Placing bid...' : 'Place Bid'}
                                    </button>
                                    <p className="text-xs text-slate-600 text-center">
                                        Must be higher than ₹{currentPrice.toLocaleString()}
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
