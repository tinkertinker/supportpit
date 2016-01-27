import React, { Component } from 'react'
import './chat-list.scss'
import moment from 'moment'
import logger from 'debug'
import classnames from 'classnames'

const debug = logger( 'tardis.chatlist' )

export default class ChatList extends Component {

	componentDidMount() {
		setInterval( () => {
			this.setState( { now: ( new Date() ).getTime() } )
		}, 1000 )
	}

	toggleOpen( isOpen, chat ) {
		if ( isOpen ) {
			this.props.onCloseChat( chat )
		} else {
			this.props.onOpenChat( chat )
		}
	}

	renderChatItem( chat, i ) {
		const open = this.props.open.indexOf( chat.id ) > -1
		return (
			<div key={i} className={ classnames( 'chat-list-item', { open } )} onDoubleClick={ ( e ) => {
				e.preventDefault()
				this.props.onOpenChat( chat )
			} }>
				<img src={ chat.user.picture } />
				<div className="chat-details">
					<div className="chat-name">{ chat.user.name }</div>
					<div>{ moment( chat.opened_at ).fromNow() }</div>
				</div>
				<div className="open-chat-button" onClick={ this.toggleOpen.bind( this, open, chat ) } />
			</div>
		)
	}

	render() {
		return (
			<div>
				<div className="title-bar">Available Chats</div>
				<div className="chat-list">
				{ this.props.chats.map( this.renderChatItem.bind( this ) ) }
				</div>
			</div>
		)
	}
}
