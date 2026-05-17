import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import AuctionsPage from './pages/AuctionsPage'

// Placeholder for pages not yet built
const Placeholder = ({ name }) => (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-sm text-slate-400">
        {name} page — coming soon
    </div>
)

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Placeholder name="Home" />} />
                    <Route path="/auctions" element={<AuctionsPage />} />
                    <Route path="/auctions/:id" element={<Placeholder name="Auction detail" />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/create"
                        element={
                            <ProtectedRoute>
                                <Placeholder name="Create auction" />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
