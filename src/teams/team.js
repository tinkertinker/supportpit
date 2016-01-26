import { v4 as uuid } from 'uuid'

const USERS = [
	{token: 'abcdefg', id: uuid(), username: 'someuser', name: 'Jane Adams', picture: 'https://avatars0.githubusercontent.com/u/19795?v=3&s=460'}
]

const MEMBERS = [
	{name: 'Robert Collins', email: 'robert@automattic.com', role: 'agent'},
	{name: 'Toni', email: 'toni@automattic.com', role: 'admin'}
]

const INVITATIONS = [
]

export default function Team( host, endpoint ) {
	this.host = host
	this.endpoint = endpoint
}

Team.prototype.identify = function( token, cb ) {
	// turn the token into a user
	let user = USERS.find( ( u ) => u.token === token )
	if ( !user ) {
		return cb( new Error( 'User not found' ) )
	}
	cb( null, user )
}

Team.prototype.invite = function( email, cb ) {
	process.nextTick( () => {
		let normalized = normalizeEmail( email )
		let existing = INVITATIONS.find( ( i ) => i[0] === normalized )

		if ( existing ) {
			return cb( null, existing )
		}

		let invite = [normalized, uuid()]
		INVITATIONS.push( invite )
		cb( null, invite )
	} )
}

Team.prototype.members = function( cb ) {
	process.nextTick( () => {
		cb( null, MEMBERS )
	} )
}

function normalizeEmail( email ) {
	return email.toLowerCase()
}
