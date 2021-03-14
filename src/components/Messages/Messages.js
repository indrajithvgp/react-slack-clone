import React, { Component } from 'react'
import {Segment, Comment} from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessagesForm from './MessagesForm'
import firebase from '../../firebase'
import Message from './Message'

export class Messages extends Component {
    state={
        messagesRef: firebase.database().ref('messages'),
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        messages:[], 
        messageLoading:true
    }
    componentDidMount(){
        const {channel, user} = this.state
        if(channel && user){
            this.addListeners(channel.id)
        }
    }
    addListeners=channelId=>{
        this.addMessageListeners(channelId)
    }
    addMessageListeners=channelId=>{
        let loadedMessages = []
        this.state.messagesRef.child(channelId).on('child_added', snap=>{
            loadedMessages.push(snap.val())
            this.setState({messages:loadedMessages, messageLoading:false})
        })
    }
    displayMessages=(messages)=>{
        const sortMessages = messages.sort((a, b)=>{
            if(a.timestamp > b.timestamp){
                return -1
            }else{
                return 1
            }
        })
        return sortMessages.length > 0 && sortMessages.map((message)=>
        (<Message key={message.timestamp} message={message} user={this.state.user}/>))
    }
    render() {
        const {messagesRef, channel, user, messages, messageLoading} = this.state
        return (
            <>
                <MessagesHeader/>
                    <Segment>
                        <Comment.Group className="messages">
                        {this.displayMessages(messages)}
                        </Comment.Group>
                    </Segment>
                <MessagesForm currentUser={user} currentChannel={channel} messagesRef={messagesRef}/>
            </>
        )
    }
}

export default Messages