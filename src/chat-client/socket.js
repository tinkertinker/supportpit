import io from 'socket.io-client'

const socket = io( '/chat' )

export default socket
