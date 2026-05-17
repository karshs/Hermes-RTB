import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { siNodedotjs, siPostgresql, siSocketdotio, siRedis, siJsonwebtokens, siRender } from 'simple-icons'

// Render a Simple Icons SVG inline
// forceWhite overrides brand color — needed for black-logo icons on dark backgrounds
function SimpleIcon({ icon, size = 28, forceWhite = false }) {
    return (
        <svg
            role="img"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill={forceWhite ? '#ffffff' : `#${icon.hex}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-label={icon.title}
        >
            <path d={icon.path} />
        </svg>
    )
}

// ── Bid ticker ────────────────────────────────────────────────────────────────
function BidTicker() {
    const price = '₹12,450.25'
    const items = Array(12).fill(`Current Bid: ${price}`)

    return (
        <div className="relative overflow-hidden py-3 border-y border-white/10 my-8">
            {/* fade edges */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0f1e] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0f1e] to-transparent z-10" />
            <div className="flex animate-[ticker_18s_linear_infinite] whitespace-nowrap">
                {items.map((item, i) => (
                    <span key={i} className="mx-8 text-sm font-medium text-slate-400">
                        <span className="text-white font-bold">{item}</span>
                    </span>
                ))}
            </div>
        </div>
    )
}

// ── Sparkline SVG (decorative) ────────────────────────────────────────────────
function Sparkline() {
    return (
        <svg viewBox="0 0 120 40" className="w-full h-10" preserveAspectRatio="none">
            <polyline
                points="0,35 15,28 25,32 35,18 45,22 55,10 65,15 75,8 85,12 95,5 105,9 120,4"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    )
}

// ── Bar chart (decorative) ────────────────────────────────────────────────────
function BarChart() {
    const bars = [18, 28, 22, 35, 30, 40, 32, 38]
    const max = Math.max(...bars)
    return (
        <div className="flex items-end gap-1 h-10 w-full">
            {bars.map((h, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-sm bg-blue-500/70"
                    style={{ height: `${(h / max) * 100}%` }}
                />
            ))}
        </div>
    )
}

// ── Dashboard card ────────────────────────────────────────────────────────────
function DashboardCard({ label, value, chart }) {
    return (
        <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-4 flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-sm font-semibold text-white mb-3">{value}</p>
            {chart === 'progress' && (
                <div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-blue-500 rounded-full" />
                    </div>
                    <p className="text-xs text-blue-400 mt-1.5">100%</p>
                </div>
            )}
            {chart === 'sparkline' && <Sparkline />}
            {chart === 'bar' && <BarChart />}
        </div>
    )
}

// ── How it Works step ─────────────────────────────────────────────────────────
function Step({ number, title, description, icon }) {
    return (
        <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-semibold">
                {number}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

// ── Tech card ─────────────────────────────────────────────────────────────────
function TechCard({ name, icon, description, forceWhite = false }) {
    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5 flex flex-col items-center text-center gap-3 hover:border-blue-500/30 transition-colors">
            <div className="w-10 h-10 flex items-center justify-center">
                <SimpleIcon icon={icon} size={32} forceWhite={forceWhite} />
            </div>
            <div>
                <p className="text-sm font-semibold text-white">{name}</p>
                {description && (
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#0a0f1e]">
            <Navbar />

            {/* ── HERO ── */}
            <div className="max-w-5xl mx-auto px-8 pt-20 pb-10 text-center">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Real-time bidding engine
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-[1.08] mb-6">
                    High-Concurrency<br />
                    <span className="text-blue-400">Real-Time Bidding</span>
                </h1>

                <p className="text-base text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
                    A high-concurrency bidding platform built with row-level locking,
                    WebSockets and Redis — engineered so no two users ever win at the same price.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <Link
                        to="/auctions"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Browse Auctions
                    </Link>
                    <Link
                        to="/login"
                        className="border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Create Account
                    </Link>
                </div>

                {/* Bid ticker */}
                <BidTicker />

                {/* Dashboard preview */}
                <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 text-left shadow-2xl shadow-black/40">
                    <p className="text-xs text-slate-500 mb-4 font-medium">Dashboard</p>
                    <div className="flex gap-3">
                        <DashboardCard
                            label="ACID Compliance"
                            value="100% ACID Compliance"
                            chart="progress"
                        />
                        <DashboardCard
                            label="Latency"
                            value="&lt;100ms Latency"
                            chart="sparkline"
                        />
                        <DashboardCard
                            label="Cache"
                            value="Redis-Powered Performance"
                            chart="bar"
                        />
                    </div>
                </div>
            </div>

            {/* ── HOW IT WORKS ── */}
            <div className="bg-white py-20">
                <div className="max-w-5xl mx-auto px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            How it Works
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <Step
                            number="1"
                            title="Bid Comes In"
                            description="User places bid. Server validates auction is active and bid is higher than current price."
                            icon="🔄"
                        />
                        <Step
                            number="4"
                            title="Live Broadcast"
                            description="Socket.io broadcasts new price to all connected users in under 100ms."
                            icon="📡"
                        />
                        <Step
                            number="2"
                            title="Row-Level Lock"
                            description="PostgreSQL locks the auction row with SELECT FOR UPDATE. No other request can touch it."
                            icon="🔒"
                        />
                        <Step
                            number="5"
                            title="Cache Invalidated"
                            description="Redis cache cleared instantly so next request fetches fresh data from PostgreSQL."
                            icon="⚡"
                        />
                        <Step
                            number="3"
                            title="Atomic Commit"
                            description="Bid inserted and price updated in one transaction. Either both happen or neither does."
                            icon="🗄️"
                        />
                        <Step
                            number="6"
                            title="Winner Declared"
                            description="When timer hits zero, the highest bidder wins. One winner, always. Guaranteed."
                            icon="🏆"
                        />
                    </div>
                </div>
            </div>

            {/* ── TECH STACK ── */}
            <div className="bg-[#0f172a] py-20">
                <div className="max-w-5xl mx-auto px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            Tech Stack
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <TechCard name="Node.js + Express" icon={siNodedotjs} description="REST API server" />
                        <TechCard name="PostgreSQL" icon={siPostgresql} description="ACID transactions" />
                        <TechCard name="Socket.io" icon={siSocketdotio} description="Real-time WebSockets" forceWhite />
                        <TechCard name="Redis" icon={siRedis} description="Cache-aside pattern" />
                        <TechCard name="JWT + bcryptjs" icon={siJsonwebtokens} description="Stateless auth" forceWhite />
                        <TechCard name="Render" icon={siRender} description="Production hosting" />
                    </div>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <footer className="bg-[#0a0f1e] border-t border-white/10 py-8">
                <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <p>Hermes-RTB — Built from scratch as a systems engineering project</p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/karshs/Hermes-RTB"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-slate-400 transition-colors"
                        >
                            GitHub
                        </a>
                        <Link to="/auctions" className="hover:text-slate-400 transition-colors">
                            Browse Auctions
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
