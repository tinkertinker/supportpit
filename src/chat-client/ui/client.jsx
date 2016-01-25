import React from 'react'
import Chat from './chat'
import { connect } from 'react-redux'
import { updateMessage, sendMessage, inputNickname, identify } from '../actions'
import './client.scss'
import logger from 'debug'

const debug = logger( 'tardis.client' )

export class Client extends React.Component {

	updateMessage( value ) {
		this.props.dispatch( updateMessage( value ) )
	}

	sendMessage() {
		if ( this.props.canSend ) {
			this.props.dispatch( sendMessage( this.props.message ) )
		}
	}

	title() {
		const { team } = this.props
		if ( team && team.host ) {
			return team.host
		}
		return 'untitled'
	}

	isRemoteMessage( action ) {
		debug( 'action is remote?', action )
		const { user } = this.props
		if ( user && action.user && action.user.token === user.token ) {
			return false
		}
		return true
	}

	authorized( isAuthed, notAuthed ) {
		if ( this.props.authorization === 'requested' ) {
			return notAuthed()
		}
		return isAuthed()
	}

	updateNickname( e ) {
		this.props.dispatch( inputNickname( e.target.value ) )
	}

	sendNickname() {
		this.props.dispatch( identify( this.props.nickname ) )
	}

	render() {
		return (
			<div className="chat-container">
				{ this.authorized( () => {
					return (
						<Chat
							actions={this.props.actions}
							pendingMessages={this.props.pendingMessages}
							message={this.props.message}
							chat={this.props.chat}
							canSend={this.props.canSend}
							onUpdateMessage={this.updateMessage.bind( this )}
							onSendMessage={this.sendMessage.bind( this )}
							title={this.title()}
							isRemoteMessage={ this.isRemoteMessage.bind( this )} />
						)
				}, () => {
					return (
						<div className="identify-form">
							<input type="text" value={ this.props.nickname } onChange={ this.updateNickname.bind( this ) } placeholder="Name" />
							<input type="button" value="Start" onClick={ this.sendNickname.bind( this ) } disabled={ this.props.nickname === '' } />
						</div>
					)
				} ) }
			</div>
		)
	}
}

function map( state ) {
	return {
		actions: state.actions,
		pendingMessages: state.pendingMessages,
		message: state.message,
		team: state.team,
		user: state.user,
		authorization: state.authorization,
		nickname: state.nickname,
		canSend: ( state.message !== '' && state.pendingMessages.length === 0 )
	}
}

export default connect( map )( Client )