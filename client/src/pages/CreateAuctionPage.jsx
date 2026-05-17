import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'

export default function CreateAuctionPage() {
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startPrice, setStartPrice] = useState('')
    const [endTime, setEndTime] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Min datetime for the picker — now + 5 minutes
    const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
        .toISOString()
        .slice(0, 16)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!title.trim()) return setError('Title is required')
        if (!startPrice || Number(startPrice) <= 0)
            return setError('Starting price must be greater than 0')
        if (!endTime) return setError('End time is required')
        if (new Date(endTime) <= new Date())
            return setError('End time must be in the future')

        setLoading(true)
        try {
            const res = await api.createAuction({
                title: title.trim(),
                description: description.trim(),
                start_price: Number(startPrice),
                end_time: new Date(endTime).toISOString(),
            })
            navigate(`/auctions/${res.data.id}`)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Navbar />

            <div className="max-w-xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
                        Create Auction
                    </h1>
                    <p className="text-sm text-slate-400">
                        List an item for real-time bidding
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6">
                    {error && (
                        <div className="mb-5 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Vintage Gibson Guitar"
                                maxLength={100}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                Description{' '}
                                <span className="text-slate-600 font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the item — condition, history, details..."
                                rows={4}
                                maxLength={500}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                            <p className="text-xs text-slate-600 mt-1 text-right">
                                {description.length}/500
                            </p>
                        </div>

                        {/* Starting price */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                Starting Price (₹) <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={startPrice}
                                    onChange={(e) => setStartPrice(e.target.value)}
                                    placeholder="1000"
                                    min="1"
                                    step="1"
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* End time */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                End Time <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                min={minDateTime}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                            />
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/5 pt-2" />

                        {/* Info note */}
                        <div className="flex items-start gap-2.5 bg-blue-500/5 border border-blue-500/10 rounded-lg px-3 py-2.5">
                            <span className="text-blue-400 text-sm mt-0.5">ℹ</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Once created, the auction goes live immediately. Bids are
                                processed atomically — no two users can win at the same price.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                        >
                            {loading ? 'Creating auction...' : 'Create Auction'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
