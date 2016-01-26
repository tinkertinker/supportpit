import { EventEmitter } from 'events'
import logger from 'debug'
import { values } from 'lodash/object'

const debug = logger( 'tardis.queue' )

class UserChat extends EventEmitter {

	constructor( id, user ) {
		super()
		this.id = id
		this.opened_at = now()
		this.user = user
	}

	asJSON() {
		return {
			user: this.user,
			id: this.id,
			opened_at: this.opened_at
		}
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
		let chat = this.users[user.id]

		if ( !chat ) {
			// TODO: make a new chat
			chat = new UserChat( user.id, user )
			this.users[user.id] = chat
		}

		return chat
	}

	// Agent is joining a support chat
	join( socket, id ) {
		// Look for the chat in the existing users, if there is no open chat then bail for now
		let chat = this.users[id]
		if ( !chat ) {
			debug( 'Chat not found for', id )
			return
		}
		return chat
	}

	openChats() {
		return values( this.users ).sort( ( a, b ) => a.opened_at > b.opened_at ? 1 : -1 )
	}

}

function now() {
	return ( new Date() ).getTime()
}
