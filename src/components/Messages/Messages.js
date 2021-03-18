import React, { Component } from 'react'
import {Segment, Comment} from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessagesForm from './MessagesForm'
import firebase from '../../firebase'
import Message from './Message'

export class Messages extends Component {
    state={
        messagesRef: firebase.database().ref('messages'),
        privateMessagesRef:firebase.database().ref('privateMessages'),
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        messages:[], 
        messageLoading:true,
        progressBar:false,
        numUniqueUsers:'',
        searchTerm:'',
        searchLoading:false,
        searchResults:[],
        isPrivateChannel:this.props.isPrivateChannel
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
        const ref = this.getMessagesRef()
        ref.child(channelId).on('child_added', snap=>{
            loadedMessages.push(snap.val())
            this.setState({messages:loadedMessages, messageLoading:false})
        })
        this.countUniqueUsers(loadedMessages)
    }
    getMessagesRef = ()=>{
        const {messagesRef, privateMessagesRef, privateChannel} = this.state
        return privateChannel ? privateMessagesRef : messagesRef
    }
    countUniqueUsers = messages =>{
        const uniqueUsers = messages.reduce((acc, message)=>{
            if(!acc.includes(message.user.name)){
                acc.push(message.user.name)
            }
            return acc
        },[])
        const numUniqueUsers = uniqueUsers.length > 1 ? `${uniqueUsers.length} Users` : `${uniqueUsers.length} User`
        this.setState({numUniqueUsers})
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

    isProgressBarVisible = (percent)=>{
        if(percent>0){
            this.setState({progressBar:false})
            // setTimeout(()=>{this.setState({progressBar:false})}, 2000)
        }
        
        
    }
    displayChannelName = channel => channel ? `${this.state.isPrivateChannel ? '@' :'#'}${channel.name}`: ''

    handleSearchChange = (e)=>{
        this.setState({searchTerm:e.target.value, searchLoading:true}
            ,()=>{
                this.handleSearchMessages()
            })
    }
    handleSearchMessages=()=>{
        const channelMessages = [...this.state.messages]
        const regex = new RegExp(this.state.searchTerm, 'gi')
        const searchResults = channelMessages.reduce((acc, message)=>{
            if(message.content && message.content.match(regex) || message.user.name.match(regex)){
                acc.push(message)
            }
            return acc
        },[])
        this.setState({searchResults})
        setTimeout(()=>this.setState({searchLoading:false}), 1000)
    }

    render() {
        const {messagesRef, isPrivateChannel, channel, user, messages, searchLoading, numUniqueUsers, progressBar, searchTerm, searchResults} = this.state
        return (
            <>
                <MessagesHeader handleSearchChange={this.handleSearchChange} 
                numUniqueUsers={numUniqueUsers}
                isPrivateChannel={isPrivateChannel} 
                searchLoading={searchLoading}
                channelName={this.displayChannelName(channel)}/>
                    <Segment>
                        <Comment.Group className={progressBar ? "messages__progress":'messages'}>
                        {searchTerm ? this.displayMessages(searchResults):this.displayMessages(messages)}
                        </Comment.Group>
                    </Segment>
                <MessagesForm getMessagesRef={this.getMessagesRef} isPrivateChannel={isPrivateChannel} isProgressBarVisible={this.isProgressBarVisible} currentUser={user} currentChannel={channel} messagesRef={messagesRef}/>
            </>
        )
    }
}

export default Messages