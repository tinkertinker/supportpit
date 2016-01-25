import React, { Component } from 'react'
import { connect } from 'react-redux'

export class ChatPanel extends Component {

	render() {
		return (
			<div>Hello World</div>
		)
	}

}

function map( state ) {
	return {
		chats: state.chats
	}
}

export default connect( map )( ChatPanel )
