import React, { Component } from 'react'
import { Menu, Icon, Modal, Form, Input , Button, Label} from 'semantic-ui-react'
import firebase from '../../firebase'
import {connect} from 'react-redux'
import {setCurrentChannel, setPrivateChannel} from '../../actions'

export class Channels extends Component {

    state = {
        user:this.props.currentUser,
        channels:[], 
        modal:false,
        channelName:"",
        channel:null,
        channelDetails:'',
        channelsRef: firebase.database().ref('channels'),
        firstLoad:true,
        activeChannel:'',
        messagesRef:firebase.database().ref('messages'),
        notifications:[],
        typingRef:firebase.database().ref('typing')
    }

    componentDidMount(){
        this.addlisteners()
    }

    componentWillUnmount(){
        this.removeListeners()
    }

    removeListeners = ()=>{
        this.state.channelsRef.off()
        this.state.channels.forEach(channel=>{
            this.state.messagesRef.child(channel.id).off()
        })
    }

    addlisteners=()=>{
        let loadedChannels = []
        this.state.channelsRef.on('child_added', snap=>{
            loadedChannels.push(snap.val())
            this.setState({channels:loadedChannels}, ()=>{this.setFirstChannel()})
            this.addNotificationListener(snap.key)
        })
    }
    addNotificationListener = channelId =>{
        this.state.messagesRef.child(channelId).on('value', snap=>{
            if(this.state.channel){
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap)
            }
        })
    }

    handleNotifications=(channelId, currentChannelId, notifications, snap)=>{
        let lastTotal = 0
        let index = notifications.findIndex(notification => notification.id === channelId)
        if(index !== -1){
            if(channelId !== currentChannelId){
                lastTotal = notifications[index].total
                if(snap.numChildren()-lastTotal > 0){
                    notifications[index].count = snap.numChildren()-lastTotal
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren()
        }else{
            notifications.push({
                id:channelId,
                total:snap.numChildren(),
                lastKnownTotal:snap.numChildren(),
                count:0
            })
        }

        this.setState({notifications})
    }
    setFirstChannel = ()=>{
        const firstChannel = this.state.channels[0]
        if(this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel)
            this.setActiveChannel(firstChannel)
            this.setState({channel:firstChannel})
        }
        this.setState({firstLoad:false})
    }


    addChannel = ()=>{
        const {channelsRef, channelName, channelDetails, user} = this.state
        const key = channelsRef.push().key
        const newChannel = {
            id:key,
            name:channelName,
            details:channelDetails,
            createdBy: {
                name:user.displayName,
                avatar:user.photoURL
            }
        }
        channelsRef.child(key).update(newChannel).then(()=>{
            this.setState({channel:'', channelDetails:''})
            this.closeModal()
            console.log("channel added")

        }).catch(error=>{
            console.log(error)
        })
    }

    setActiveChannel=(channel)=>{
        this.setState({activeChannel: channel})
    }
    clearNotification = ()=>{
        let index = this.state.notifications.findIndex(notification=>notification.id === this.state.channel.id);

        if(index !== -1){
            let updatedNotifications = [...this.state.notifications]
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal
            updatedNotifications[index].count = 0
            this.setState({notifications: updatedNotifications})
        }
    }
    changeChannel = (channel)=>{

        this.setActiveChannel(channel)
        this.state.typingRef.child(this.state.channel.id).child(this.state.user.uid).remove()
        this.clearNotification()
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)
        this.setState({channel})

    }

    getNotificationCount = (channel)=>{
        let count = 0
        this.state.notifications.forEach(notification=>{
            if(notification.id === channel.id){
                count = notification.count
            }
        })

        if(count>0) return count
    }

    displayChannels = (channels)=>(
        channels.length > 0 && channels.map((channel)=>
        (
            <Menu.Item 
            onClick={()=>this.changeChannel(channel)}
            key={channel.id} 
            name={channel.name} 
            active={channel.id === this.state.activeChannel.id}
            style={{opacity:0.7}}>
            {this.getNotificationCount(channel)&&(<Label color='red'>{this.getNotificationCount(channel)}</Label>)}
            {'#'+ channel.name}</Menu.Item>
        ))
    )
    handleSubmit = (e)=>{
        e.preventDefault()
        if(this.isFormValid(this.state)){
            this.addChannel()
        }
    }

    isFormValid = ({channelName, channelDetails}) => channelName && channelDetails

    closeModal =()=> this.setState({modal:false})

    openModal =()=> this.setState({modal:true})

    handleChange =(e)=> this.setState({[e.target.name]:e.target.value})

    closeModal=()=>this.setState({modal:false})


    render() {
        const {channels, modal} = this.state
        return (
            <React.Fragment>
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="exchange"/>CHANNELS
                    </span>
                    ({channels.length})<Icon name='add' onClick={this.openModal}/>
                </Menu.Item>
                {this.displayChannels(channels)}
            </Menu.Menu>
            <Modal basic open={modal} onClose={this.closeModal}>
                <Modal.Header>Add a Channel</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <Input
                        fluid
                        label="Name of the Channel"
                        name="channelName"
                        onChange={this.handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Input
                        fluid
                        label="About the Channel"
                        name="channelDetails"
                        onChange={this.handleChange}
                        />
                    </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted onClick={this.handleSubmit}>
                        <Icon name="checkmark"/>Add
                    </Button>
                    <Button color="red" inverted onClick={this.closeModal}>
                        <Icon name="remove"/>Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
            </React.Fragment>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels)
