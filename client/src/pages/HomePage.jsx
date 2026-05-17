import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { siNodedotjs, siPostgresql, siSocketdotio, siRedis, siJsonwebtokens, siRender } from 'simple-icons'

// ── Simple Icons SVG ──────────────────────────────────────────────────────────
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

// ── Bid ticker + wave line + sun dot ─────────────────────────────────────────
const BIDS = [
    '₹5,000.00', '₹6,200.00', '₹7,450.00', '₹8,100.50',
    '₹9,300.00', '₹10,750.25', '₹11,200.00', '₹12,450.25',
]
const FINAL_BID = '₹12,450.25'
const FINAL_INDEX = BIDS.indexOf(FINAL_BID)

// Tall wave — crests and troughs cover generous vertical space
const WAVE_PATH = 'M0,60 C80,0 160,120 250,60 C340,0 420,120 500,60 C580,0 660,120 750,60 C840,0 920,120 1000,60'
const PATH_LENGTH = 1200

function BidTicker() {
    const trackRef = useRef(null)
    const pathRef = useRef(null)
    const [stopped, setStopped] = useState(false)
    const [glowVisible, setGlowVisible] = useState(false)

    useEffect(() => {
        const track = trackRef.current
        if (!track) return

        const ITEM_W = 200
        const centerOffset = (track.parentElement.offsetWidth / 2) - (ITEM_W / 2)
        const finalX = -(FINAL_INDEX * ITEM_W) + centerOffset
        const overshoot = finalX - 60

        // Phase 1: fast scroll (0 → 950ms)
        track.style.transition = 'transform 0.9s cubic-bezier(0.1, 0, 0.3, 1)'
        track.style.transform = `translateX(${overshoot}px)`

        // Phase 2: spring back to final (950 → 1500ms)
        const t1 = setTimeout(() => {
            track.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
            track.style.transform = `translateX(${finalX}px)`
        }, 950)

        // Phase 3: bid stops, wave starts drawing (1500ms)
        const t2 = setTimeout(() => {
            setStopped(true)
            if (pathRef.current) {
                pathRef.current.style.transition = `stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)`
                pathRef.current.style.strokeDashoffset = '0'
            }
        }, 1500)

        // Phase 4: wave done, sun dot appears (1500 + 1500ms)
        const t3 = setTimeout(() => setGlowVisible(true), 3000)

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }, [])

    return (
        <div className="my-8 flex flex-col items-center">

            {/* ── Reel strip ── */}
            <div className="relative w-full overflow-hidden py-3 border-y border-white/10">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0f1e] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0f1e] to-transparent z-10 pointer-events-none" />
                <div
                    ref={trackRef}
                    className="flex will-change-transform"
                    style={{ transform: 'translateX(0px)' }}
                >
                    {BIDS.map((bid, i) => (
                        <div
                            key={i}
                            className="shrink-0 flex items-center justify-center text-sm font-semibold transition-colors duration-500"
                            style={{
                                width: 200,
                                color: stopped && i === FINAL_INDEX ? '#60a5fa' : '#475569',
                                textShadow: stopped && i === FINAL_INDEX
                                    ? '0 0 20px rgba(96,165,250,0.5)'
                                    : 'none',
                            }}
                        >
                            Current Bid: {bid}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Wave stroke line + sun dot ── */}
            <div className="relative w-full" style={{ height: 120 }}>
                {/* SVG wave — draws left to right after bid stops */}
                <svg
                    viewBox="0 0 1000 120"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 top-0 w-full"
                    style={{ height: 120 }}
                    aria-hidden="true"
                >
                    <defs>
                        {/* Fade mask: transparent at edges, solid in center */}
                        <linearGradient id="waveFade" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="white" stopOpacity="0" />
                            <stop offset="10%" stopColor="white" stopOpacity="1" />
                            <stop offset="90%" stopColor="white" stopOpacity="1" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        <mask id="waveMask">
                            <rect x="0" y="0" width="1000" height="120" fill="url(#waveFade)" />
                        </mask>
                    </defs>
                    <path
                        ref={pathRef}
                        d={WAVE_PATH}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        mask="url(#waveMask)"
                        style={{
                            strokeDasharray: PATH_LENGTH,
                            strokeDashoffset: PATH_LENGTH,
                            filter: glowVisible
                                ? 'drop-shadow(0 0 5px rgba(96,165,250,0.8)) drop-shadow(0 0 12px rgba(96,165,250,0.4))'
                                : 'none',
                            transition: 'filter 0.6s ease',
                        }}
                    />
                </svg>

                {/* Sun dot — centered on the wave, appears after wave finishes */}
                <div
                    className="absolute"
                    style={{
                        left: '50%',
                        top: 60,
                        transform: 'translate(-50%, -50%)',
                        opacity: glowVisible ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                    }}
                >
                    {/* Ambient radial bloom */}
                    <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            width: 100, height: 100,
                            left: '50%', top: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'radial-gradient(circle, rgba(96,165,250,0.22) 0%, rgba(96,165,250,0.08) 45%, transparent 70%)',
                        }}
                    />
                    {/* Expanding ring 1 */}
                    <span
                        className="absolute rounded-full border border-blue-400/25 pointer-events-none"
                        style={{
                            width: 32, height: 32,
                            left: '50%', top: '50%',
                            transform: 'translate(-50%, -50%)',
                            animation: glowVisible ? 'sunRing 2.4s ease-out infinite' : 'none',
                        }}
                    />
                    {/* Expanding ring 2 — staggered */}
                    <span
                        className="absolute rounded-full border border-blue-400/15 pointer-events-none"
                        style={{
                            width: 32, height: 32,
                            left: '50%', top: '50%',
                            transform: 'translate(-50%, -50%)',
                            animation: glowVisible ? 'sunRing 2.4s ease-out 0.9s infinite' : 'none',
                        }}
                    />
                    {/* Core dot */}
                    <span
                        className="relative block rounded-full bg-blue-400"
                        style={{
                            width: 8, height: 8,
                            boxShadow: '0 0 6px 2px rgba(96,165,250,0.9), 0 0 16px 5px rgba(96,165,250,0.5), 0 0 36px 10px rgba(96,165,250,0.2)',
                            animation: glowVisible ? 'sunPulse 2s ease-in-out infinite' : 'none',
                        }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes sunPulse {
                    0%, 100% { transform: scale(1);    opacity: 1; }
                    50%       { transform: scale(1.45); opacity: 0.7; }
                }
                @keyframes sunRing {
                    0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.55; }
                    100% { transform: translate(-50%, -50%) scale(3.6); opacity: 0; }
                }
            `}</style>
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
function Step({ number, title, description }) {
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

                {/* Bid ticker + wave + sun dot */}
                <BidTicker />
            </div>

            {/* ── DASHBOARD ── */}
            <div className="bg-[#0a0f1e] py-16">
                <div className="max-w-5xl mx-auto px-8">
                    <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/40">
                        <p className="text-xs text-slate-500 mb-5 font-medium uppercase tracking-wider">Dashboard</p>
                        <div className="flex gap-4">
                            <DashboardCard label="ACID Compliance" value="100% ACID Compliance" chart="progress" />
                            <DashboardCard label="Latency" value="&lt;100ms Latency" chart="sparkline" />
                            <DashboardCard label="Cache" value="Redis-Powered Performance" chart="bar" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── HOW IT WORKS ── */}
            <div className="bg-white py-20">
                <div className="max-w-5xl mx-auto px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">How it Works</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <Step number="1" title="Bid Comes In" description="User places bid. Server validates auction is active and bid is higher than current price." />
                        <Step number="4" title="Live Broadcast" description="Socket.io broadcasts new price to all connected users in under 100ms." />
                        <Step number="2" title="Row-Level Lock" description="PostgreSQL locks the auction row with SELECT FOR UPDATE. No other request can touch it." />
                        <Step number="5" title="Cache Invalidated" description="Redis cache cleared instantly so next request fetches fresh data from PostgreSQL." />
                        <Step number="3" title="Atomic Commit" description="Bid inserted and price updated in one transaction. Either both happen or neither does." />
                        <Step number="6" title="Winner Declared" description="When timer hits zero, the highest bidder wins. One winner, always. Guaranteed." />
                    </div>
                </div>
            </div>

            {/* ── TECH STACK ── */}
            <div className="bg-[#0f172a] py-20">
                <div className="max-w-5xl mx-auto px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Tech Stack</h2>
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
                        <a href="https://github.com/karshs/Hermes-RTB" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">
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
