import React, { Component } from 'react'
import {Segment, Comment} from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessagesForm from './MessagesForm'
import firebase from '../../firebase'
import Message from './Message'
import {connect} from 'react-redux'
import {setUserPosts} from '../../actions'
import Typing from './Typing'
import Skeleton from './Skeleton'

export class Messages extends Component {
    state={
        messagesRef: firebase.database().ref('messages'),
        privateMessagesRef:firebase.database().ref('privateMessages'),
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        messages:[], 
        usersRef:firebase.database().ref('users'),
        messageLoading:true,
        progressBar:false,
        numUniqueUsers:'',
        searchTerm:'',
        searchLoading:false,
        searchResults:[],
        isChannelStarred:false,
        isPrivateChannel:this.props.isPrivateChannel,
        typingRef:firebase.database().ref('typing'),
        typingUsers:[],
        connectedRef:firebase.database().ref('info/connected'),
        listeners:[]
    }
    componentDidMount(){
        const {channel, user, listeners} = this.state
        if(channel && user){
            this.removeListeners(listeners)
            this.addListeners(channel.id)
            this.addUserStarsListeners(channel.id, user.uid)    
        }
    }
    componentWillUnmount(){
        this.removeListeners(this.state.listeners)
        this.state.connectedRef.off()
    }
    removeListeners = listeners => {
        listeners.forEach(listener =>{
            listener.ref.child(listener.id).off(listener.event);
        })
    }
    addToListeners = (id, ref, event)=>{
        const index = this.state.listeners.findIndex(listener=>{
            return listener.id ===id && listener.ref === ref && listener.event === event
        })
        if(index == -1){
            const newListener = {id, ref, event}
            this.setState({listeners:this.state.listeners.concat(newListener)})
        }
    }
    // componentDidUpdate(prevProps, prevState){
    //     if(this.messagesEnd){
    //         this.scrollToBottom()
    //     }
    // }
    scrollToBottom=()=>{
        this.messagesEnd.scrollIntoView({behaviour:'smooth'})
    }
    addUserStarsListeners = (channelId, userId) => {
        this.state.usersRef.child(userId).child('starred').once('value')
        .then(data=>{
            if(data.val()!==null){
                const channelIds = Object.keys(data.val())
                const prevStarred = channelIds.includes(channelId)
                this.setState({isChannelStarred:prevStarred})
            }
        })
    }
    handleStar = ()=>{
        this.setState(prevState => ({isChannelStarred:!prevState.isChannelStarred}), ()=>this.starChannel())
    }
    starChannel  = ()=>{
        if(this.state.isChannelStarred){
            this.state.usersRef.child(`${this.state.user.uid}/starred`)
            .update({
                [this.state.channel.id]:{
                    name: this.state.channel.name,
                    details:this.state.channel.details,
                    createdBy:{
                        name:this.state.channel.createdBy.name,
                        avatar:this.state.channel.createdBy.avatar
                    }
                }
            })
        }else{
            this.state.usersRef.child(`${this.state.user.uid}/starred`)
            .child(this.state.channel.id)
            .remove(err=>{
                if(err!==null){
                    console.log(err)
                }
            })
        }
    }
    addListeners=channelId=>{
        this.addMessageListeners(channelId)
        this.addTypingListeners(channelId)
    }
    addTypingListeners = channelId=>{
        let typingUsers = [];
        this.state.typingRef.child(channelId).on('child_added', snap=>{
            if(snap.key!==this.state.user.uid){
                typingUsers = typingUsers.concat({
                    id: snap.key, 
                    name:snap.val()
                })
                this.setState({typingUsers: typingUsers})
            }
        })
        this.addToListeners(channelId, this.state.typingRef, 'child_added')

        this.state.typingRef.child(channelId).on('child_removed', snap=>{
            const index = typingUsers.findIndex(user => user.id === snap.key)
            if(index!==-1){
                typingUsers=typingUsers.filter(user=>user.id!== snap.key)
                this.setState({typingUsers})
            }
        })
        this.addToListeners(channelId, this.state.typingRef, 'child_removed')
        this.state.connectedRef.on('value', snap=>{
            if(snap.val()===true){
                this.state.typingRef.child(channelId).child(this.state.user.uid)
                .onDisconnect().remove(err=>{
                    if(err!==null){
                        console.log(err)
                    }
                })
            }
        })

    }

    addMessageListeners=channelId=>{
        let loadedMessages = []
        const ref = this.getMessagesRef()
        ref.child(channelId).on('child_added', snap=>{
            loadedMessages.push(snap.val())
            this.setState({messages:loadedMessages, messageLoading:false})
        })
        this.countUniqueUsers(loadedMessages)
        this.countUserPosts(loadedMessages)
        this.addToListeners(channelId, ref, 'child_added')
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

    countUserPosts = (messages)=>{
        const userPosts = messages.reduce((acc, message)=>{
            if(message.user.name in acc){
                acc[message.user.name].count +=1
            }else{
                acc[message.user.name] = {
                    avatar:message.user.avatar,
                    count:1
                }
            }
            return acc
        }, {})
        this.props.setUserPosts(userPosts)
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
            setTimeout(()=>{this.setState({progressBar:false})}, 2000)
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

    // displayTypingUsers = users =>(
    //     users.length > 0 && users.map(user => (
    //         <div key={user.id} style={{display:'flex', marginBottom:'0.2em', alignItems: 'center'}}><span className="user__typing">Douglas is Typing</span><Typing/></div>
    //     ))
    // )

    displayMessagesSkeleton =(loading)=>( loading ? (<React.Fragment>  {[...Array(10)].map((_,i)=> (<Skeleton key={i}/>))} </React.Fragment>) : null )
        
        

    render() {
        const {messagesRef, isPrivateChannel, privateChannel, isChannelStarred, 
            channel, user, messages, searchLoading, numUniqueUsers, 
            typingUsers, progressBar, searchTerm, searchResults, messageLoading} = this.state
        return (
            <>
                <MessagesHeader handleSearchChange={this.handleSearchChange} 
                numUniqueUsers={numUniqueUsers}
                isPrivateChannel={isPrivateChannel} 
                searchLoading={searchLoading}
                handleStar={this.handleStar}
                isChannelStarred={isChannelStarred}
                channelName={this.displayChannelName(channel)}/>
                    <Segment>
                        <Comment.Group className={progressBar ? "messages__progress":'messages'}>
                        {this.displayMessagesSkeleton(messageLoading)}
                        {searchTerm ? this.displayMessages(searchResults):this.displayMessages(messages)}
                        
                        <div ref={node=>(this.messagesEnd =node)}></div>
                        </Comment.Group>
                    </Segment>
                <MessagesForm getMessagesRef={this.getMessagesRef} isPrivateChannel={isPrivateChannel} isProgressBarVisible={this.isProgressBarVisible} currentUser={user} currentChannel={channel} messagesRef={messagesRef}/>
            </>
        )
    }
}

export default connect(null, {setUserPosts})(Messages)

