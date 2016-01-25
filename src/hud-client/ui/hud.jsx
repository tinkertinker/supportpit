import React, { Component } from 'react'
import { connect, Provider } from 'react-redux'
import ChatList from './chat-list'
import Chat from '../../chat-client/ui/chat'
import { joinChat } from '../actions'
import log from 'debug'

const debug = log( 'tardis.hud' )

import './hud.scss'

export class Hud extends Component {

	openChat( chat ) {
		this.props.dispatch( joinChat( chat ) )
	}

	updateMessage() {
	}

	sendMessage() {
	}

	isRemoteMessage() {
		return true
	}

	renderChatPanel( chat, i ) {
		return (
			<div className="panel" key={i}>
				<Chat
					actions={chat.actions}
					pendingMessages={[]}
					message={''}
					chat={this.props.chat}
					canSend={this.props.canSend}
					onUpdateMessage={this.updateMessage.bind( this )}
					onSendMessage={this.sendMessage.bind( this )}
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
		availableChats: state.availableChats
	}
}

export default connect( map )( Hud )
