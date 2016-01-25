import socketio from 'socket.io-client'

const socket = socketio( '/' )

export { socket as default }
