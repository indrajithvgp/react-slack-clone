import React from 'react'
import {Grid} from "semantic-ui-react"
import "./App.css"
import ColorPanel from './ColorPanel/ColorPanel'
import Messages from './Messages/Messages'
import MetaPanel from './MetaPanel/MetaPanel'
import SidePanel from './SidePanel/SidePanel'
import {connect} from "react-redux"

function App({currentUser, currentChannel, isPrivateChannel, userPosts}) {
    return (
        <Grid columns="equal" className="app" style={{background:'#eee'}}>
            <ColorPanel/> 
            <SidePanel key={currentUser && currentUser.id} currentUser={currentUser}/> 
            <Grid.Column style={{marginLeft:320}}>
                <Messages key ={currentChannel && currentChannel.id}
                currentUser={currentUser}
                currentChannel={currentChannel}
                isPrivateChannel={isPrivateChannel}/>
            </Grid.Column>
            <Grid.Column width={4}>
                <MetaPanel key={currentChannel && currentChannel.id} 
                currentChannel={currentChannel}
                userPosts={userPosts}
                isPrivateChannel={isPrivateChannel}/>
            </Grid.Column>
        </Grid>
    )
}

const mapStateToProps = state => ({
    currentUser:state.user.currentUser,
    currentChannel:state.channel.currentChannel,
    isPrivateChannel:state.channel.isPrivateChannel,
    userPosts:state.channel.userPosts,
})

export default connect(mapStateToProps)(App)
