// All API calls go through /api prefix
// In dev: Vite proxies /api → http://localhost:3000 (strips /api prefix)
// In prod: Express serves the built client and handles /auth, /auctions directly
const API_BASE = import.meta.env.PROD ? '' : '/api'

const getToken = () => localStorage.getItem('token')

const apiFetch = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    const token = getToken()
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
    }

    return data
}

export const api = {
    // Auth
    register: (body) =>
        apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) =>
        apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => apiFetch('/auth/me'),

    // Auctions
    getAuctions: () => apiFetch('/auctions'),
    getAuction: (id) => apiFetch(`/auctions/${id}`),
    createAuction: (body) =>
        apiFetch('/auctions', { method: 'POST', body: JSON.stringify(body) }),
    placeBid: (id, amount) =>
        apiFetch(`/auctions/${id}/bid`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        }),
}
