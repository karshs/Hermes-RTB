// In dev, Vite proxies /auth and /auctions to localhost:3000
// In production, requests go to the same origin (Express serves the built client)
const API_BASE = ''

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
