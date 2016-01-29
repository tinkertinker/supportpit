export const when = ( condition, perform ) => ( props ) => condition( props ) ? perform( props ) : null
export const not = ( fn ) => ( ... args ) => !fn( ... args )
export const or = ( ... all ) => ( ... args ) => all.find( ( fn ) => fn( ... args ) )
export const and = ( ... all ) => ( ... args ) => !all.find( ( fn ) => !fn( ...args ) )
