const API_BASE = 'https://hermes-rtb.onrender.com';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

// Save auth data
const saveAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Clear auth data
const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Check if logged in
const isLoggedIn = () => !!getToken();

// Base fetch function
const apiFetch = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (getToken()) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// API calls
const api = {
    // Auth
    register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => apiFetch('/auth/me'),

    // Auctions
    getAuctions: () => apiFetch('/auctions'),
    getAuction: (id) => apiFetch(`/auctions/${id}`),
    createAuction: (body) => apiFetch('/auctions', { method: 'POST', body: JSON.stringify(body) }),
    placeBid: (id, amount) => apiFetch(`/auctions/${id}/bid`, { method: 'POST', body: JSON.stringify({ amount }) }),
};