import React, { Component } from 'react'
import classnames from 'classnames'

import './chat.scss'

export default class Chat extends Component {

	constructor( props ) {
		super( props )

		this.state = { autoscroll: true }
	}

	chatImage() {
		if ( this.props.userImage ) {
			return (
				<img src={ this.props.userImage } />
			)
		}
	}

	updateMessage( e ) {
		this.props.onUpdateMessage( e.target.value )
	}

	sendMessage() {
		if ( this.props.canSend ) {
			this.props.onSendMessage( this.props.message )
		}
	}

	renderPendingMessage( action, i ) {
		return (
			<div key={i} className="message">
				<div className="content">{ action.message }</div>
				<div className="author">Name</div>
			</div>
		)
	}

	renderAction( action, i ) {
		switch ( action.type ) {
			case 'message':
				return (
					<div key={i} className={ classnames( 'message', { remote: this.props.isRemoteMessage( action ) } ) }>
						<div className="content">{ action.message }</div>
						<div className="author">{ action.user.name }</div>
					</div>
				)
			case 'join':
				return (
					<div key={i} className={ classnames( 'event', 'join' ) }>
						<p>{ action.user.name } joined.</p>
					</div>
				)
			default:
				return ( <div className="unknown"></div> )
		}
	}

	keyDown( e ) {
		switch ( e.which ) {
			case 13:
				e.preventDefault()
				this.sendMessage()
				return
		}
	}

	updateScrollOffset( log ) {
		if ( log && this.state.autoscroll ) {
			const { offsetHeight, scrollHeight } = log
			if ( scrollHeight > offsetHeight ) {
				log.scrollTop = scrollHeight - offsetHeight
			}
		}
	}

	onScrollLog( e ) {
		let { offsetHeight, scrollTop, scrollHeight } = e.target
		if ( scrollHeight <= offsetHeight ) {
			return
		}
		let bottom = scrollHeight - offsetHeight
		if ( scrollTop >= bottom ) {
			this.setState( {autoscroll: true} )
		} else {
			this.setState( {autoscroll: false} )
		}
	}

	render() {
		const buttonDisabled = !this.props.canSend
		return (
			<div className="chat">
				<div className="title-bar">{ this.props.title }</div>
				<div ref={( n ) => this.updateScrollOffset( n ) } className="log" onScroll={ this.onScrollLog.bind( this ) }>
					<div className="messages">
						{ this.props.actions.map( this.renderAction.bind( this ) ) }
					</div>
					<div className="pendingMessages">
						{ this.props.pendingMessages.map( this.renderPendingMessage ) }
					</div>
				</div>
				<div className="editor">
					{ this.chatImage() }
					<textarea value={this.props.message} onKeyDown={ this.keyDown.bind( this ) } onChange={ this.updateMessage.bind( this ) }/>
					<div tabIndex={-1} className={classnames( {disabled: buttonDisabled} )} onClick={ this.sendMessage.bind( this ) }>Send</div>
				</div>
			</div>
		)
	}
}
