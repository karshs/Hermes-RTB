import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    // On mount, if a token exists verify it's still valid
    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }

        api.getMe()
            .then((res) => setUser(res.user))
            .catch(() => {
                // Token is invalid or expired — clear it
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

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
