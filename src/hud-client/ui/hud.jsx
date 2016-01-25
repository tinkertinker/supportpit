import React, { Component } from 'react'
import { connect, Provider } from 'react-redux'
import ChatList from './chat-list'
import Chat from '../../chat-client/ui/chat'
import { joinChat, updateChatMessage, sendChatMessage } from '../actions'
import log from 'debug'

const debug = log( 'tardis.hud' )

import './hud.scss'

export class Hud extends Component {

	openChat( chat ) {
		this.props.dispatch( joinChat( chat ) )
	}

	updateMessage( chat, message ) {
		this.props.dispatch( updateChatMessage( chat, message ) )
	}

	sendMessage( chat, message ) {
		this.props.dispatch( sendChatMessage( chat, message ) )
	}

	isRemoteMessage( action ) {
		if ( this.props.user && action.user && this.props.user.id === action.user.id ) {
			return true
		}
		return false
	}

	renderChatPanel( chat, i ) {
		const { id } = chat
		let message = this.props.editing[id] || ''
		let canSend = message && message !== ''
		let pending = this.props.pending[id] || []
		return (
			<div className="panel" key={i}>
				<Chat
					actions={chat.actions}
					pendingMessages={pending}
					message={message}
					chat={this.props.chat}
					canSend={canSend}
					onUpdateMessage={this.updateMessage.bind( this, chat )}
					onSendMessage={this.sendMessage.bind( this, chat )}
					title={chat.user.name}
					isRemoteMessage={this.isRemoteMessage.bind( this )} />
			</div>
		)
	}

	render() {
		return (
			<div className="hud">
				<div className="queue-list">
					<ChatList chats={this.props.availableChats} onOpenChat={this.openChat.bind( this )} />
				</div>
				<div className="chat-panels">
					{ this.props.chats.map( this.renderChatPanel.bind( this ) ) }
				</div>
			</div>
		)
	}

}

function map( state ) {
	return {
		chats: state.chats,
		availableChats: state.availableChats,
		editing: state.editing,
		pending: state.pending,
		user: state.user
	}
}

export default connect( map )( Hud )
