import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

// In dev, connect directly to Express (Vite WS proxy can be flaky)
// In prod, same origin as the Express server
const SOCKET_URL = import.meta.env.PROD
    ? window.location.origin
    : 'http://localhost:3000'

export function useSocket(auctionId, { onNewBid } = {}) {
    // Keep the callback in a ref so the socket effect never needs to re-run
    // when the parent component re-renders with a new function reference
    const onNewBidRef = useRef(onNewBid)
    useEffect(() => {
        onNewBidRef.current = onNewBid
    })

    useEffect(() => {
        if (!auctionId) return

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        })

        socket.on('connect', () => {
            socket.emit('join_auction', auctionId)
        })

        socket.on('new_bid', (data) => {
            if (onNewBidRef.current) onNewBidRef.current(data)
        })

        socket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message)
        })

        return () => {
            socket.disconnect()
        }
    }, [auctionId]) // only reconnect if auctionId changes

    return null
}
