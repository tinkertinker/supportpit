import React, { Component } from 'react'
import './chat-list.scss'
import moment from 'moment'
import logger from 'debug'

const debug = logger( 'tardis.chatlist' )

export default class ChatList extends Component {

	componentDidMount() {
		setInterval( () => {
			this.setState( { now: ( new Date() ).getTime() } )
		}, 1000 )
	}

	renderChatItem( chat, i ) {
		return (
			<div key={i} className="chat-list-item" onDoubleClick={ () => this.props.onOpenChat( chat ) }>
				<img src={ chat.user.picture } />
				<div>
					<div className="chat-name">{ chat.user.name }</div>
					<div>{ moment( chat.opened_at ).fromNow() }</div>
				</div>
			</div>
		)
	}

	render() {
		return (
			<div>
				<div className="title-bar">Open Chats</div>
				<div className="chat-list">
				{ this.props.chats.map( this.renderChatItem.bind( this ) ) }
				</div>
			</div>
		)
	}
}
