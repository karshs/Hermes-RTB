import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-8 h-14 bg-[#0f172a] border-b border-white/10">
            <Link to="/" className="text-white font-bold text-base tracking-tight">
                Hermes-RTB
            </Link>

            <div className="flex items-center gap-3">
                <Link
                    to="/auctions"
                    className="text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-1.5 rounded-lg transition-colors"
                >
                    Browse Auctions
                </Link>

                {user ? (
                    <>
                        <span className="text-sm text-slate-400">
                            Hi, {user.username}
                        </span>
                        <Link
                            to="/create"
                            className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors"
                        >
                            + New Auction
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-1.5 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors"
                    >
                        Get Started
                    </Link>
                )}
            </div>
        </nav>
    )
}
