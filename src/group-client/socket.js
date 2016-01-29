import SocketIO from 'socket.io-client'

const socket = new SocketIO( '/group' )
export { socket as default }
