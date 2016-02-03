/*
 * If condition evaluates to truthy, execute perform.
 */
export const when = ( condition, perform ) => ( props ) => condition( props ) ? perform( props ) : null

/*
 * Inverts the result of the given fn
 */
export const not = ( fn ) => ( ... args ) => !fn( ... args )

/*
 * Returns true if any of the given fn's evaluate to true
 */
export const or = ( ... all ) => ( ... args ) => all.find( ( fn ) => fn( ... args ) )

/*
 * Returns true if all of the given fn's evalue to true
 */
export const and = ( ... all ) => ( ... args ) => !all.find( ( fn ) => !fn( ...args ) )

/*
 * Returns a function that iterates through actions and returns result of the first action
 * that evalues to a truthy value
 *
 * If no action produces a truthy value, it throws an Error
 */
export const pipe = ( ... actions ) => ( ... args ) => {
	var i = 0, action, result
	for ( i = 0; i < actions.length; i++ ) {
		action = actions[i]
		result = action( ... args )
		if ( result ) {
			return result
		}
	}
	throw new Error( 'Nothing to render' )
}
