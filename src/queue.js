import { EventEmitter } from 'events'
import logger from 'debug'

const debug = logger( 'tardis.queue' )

class UserChat extends EventEmitter {

	constructor( id, user ) {
		super()
		this.id = id
		this.user = user
	}

}

export default class Queue extends EventEmitter {

	constructor( io ) {
		super()
		this.io = io
		this.users = {}
	}

	// User is opening a support chat to get support
	open( socket, user ) {
		let chat = this.users[socket.id]

		if ( !chat ) {
			// TODO: make a new chat
			chat = new UserChat( socket.id, user )
			this.users[socket.id] = chat
		}

		return chat
	}

	// Agent is joining a support chat
	join( socket, id, complete ) {
		// Look for the chat in the existing users, if there is no open chat then bail for now
		let chat = this.users[id]
		if ( !chat ) {
			debug( 'Chat not found for', id )
		}
		return chat
	}

}
