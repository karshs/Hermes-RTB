import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }
        api.getMe()
            .then((res) => setUser(res.user))
            .catch(() => {
                localStorage.removeItem('token')
                setToken(null)
            })
            .finally(() => setLoading(false))
    }, [token])

    const login = useCallback(async (email, password) => {
        const res = await api.login({ email, password })
        localStorage.setItem('token', res.token)
        setToken(res.token)
        setUser(res.user)
        return res
    }, [])

    const register = useCallback(async (username, email, password) => {
        const res = await api.register({ username, email, password })
        localStorage.setItem('token', res.token)
        setToken(res.token)
        setUser(res.user)
        return res
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }, [])

    // Refresh user data from server (e.g. after topup or bid)
    const refreshUser = useCallback(async () => {
        try {
            const res = await api.getMe()
            setUser(res.user)
        } catch {
            // silently fail
        }
    }, [])

    // Update user in context directly (e.g. after topup returns new balance)
    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser)
    }, [])

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
