const debug = require( 'debug' )( 'tardis:bot' )
import { v4 as uuid } from 'uuid'
import { any, times, everyCount } from './react-fn'

const alternate = ( ... options ) => () => {
	const [ current, ... rest ] = options
	options = rest.concat( current )
	return current
}

const createMessage = alternate(
	'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
	'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut',
	'aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
	'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
)

const matches = ( regexp, map = ( { message } ) => message ) => ( fn ) => ( ... args ) => {
	const results = regexp.exec( map( ... args ) )
	if ( results ) {
		debug( 'found', results )
		fn( ... args.concat( [results] ) )
		return true
	}
}

const delay = ( ms, fn ) => ( ... args ) => setTimeout( () => fn( ...args ), ms )
const delayedMatch = ( regex, fn, ms = 1000 ) => matches( regex )( delay( ms, fn ) )

const cheekyHelp = delayedMatch( /\bhelp\b/, ( { resolve } ) => resolve( { message: 'Did you try turning it off and on again?' } ) )
const replyWithCount = delayedMatch( /^reply with ([\d])/i, ( { resolve }, results ) => times( parseInt( results[1] ), () => resolve( { message: createMessage() } ) )() )
const getMeCoffee = delayedMatch( /\bcoffee\b/i, ( { resolve } ) => resolve( { message: 'I could really use a cup of coffee' } ) )
const reply = delayedMatch( /\breply\b/i, ( { resolve } ) => setTimeout( () => resolve( { message: createMessage() } ) ) )
const dontKnow = everyCount( 5, delay( 1000, ( { resolve } ) => resolve( { message: 'I have no clue what you\'re talking about' } ) ) )
const hello = delayedMatch( /^hello$/i, ( { resolve } ) => {
	[ 'Hello', 'It\'s me', 'I was wondering if after all this time you\'d like to meet ...', 'to go over', 'ev-er-y-thing' ].forEach( ( message, i ) => {
		setTimeout( () => resolve( { message } ), i * 2000 + 400 )
	} )
} )
const yo = delayedMatch( /wapuu/i, ( { resolve } ) => resolve( { message: 'yo!' } ) )

const detectors = any(
	replyWithCount,
	cheekyHelp,
	getMeCoffee,
	reply,
	hello,
	dontKnow,
	yo,
	( { reject } ) => reject ? reject( new Error( 'Message not understood' ) ) : null
)

export function fakeMessage( { connection, message } ) {
	connection.emit( 'event', {
		id: uuid(),
		type: 'message',
		message: message || createMessage(),
		user: { nick: 'Smeagol', picture: 'https://cldup.com/3yiF9JyZr0.jpeg', id: 12345 }
	} )
}

export { detectors as bot }
