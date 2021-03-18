import React, { Component } from 'react'
import { Menu, Icon, Modal, Form, Input , Button} from 'semantic-ui-react'
import firebase from '../../firebase'
import {connect} from 'react-redux'
import {setCurrentChannel, setPrivateChannel} from '../../actions'

export class Channels extends Component {

    state = {
        user:this.props.currentUser,
        channels:[], 
        modal:false,
        channelName:"",
        channelDetails:'',
        channelsRef: firebase.database().ref('channels'),
        firstLoad:true,
        activeChannel:'',
        messagesRef:firebase.database().ref('messages'),
        notifications:[]
    }

    componentDidMount(){
        this.addlisteners()
    }

    componentWillUnmount(){
        this.removeListeners()
    }

    removeListeners = ()=>{
        this.state.channelsRef.off()
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

    // handleNotifications=()
    setFirstChannel = ()=>{
        const firstChannel = this.state.channels[0]
        if(this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel)
            this.setActiveChannel(firstChannel)
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

    changeChannel = (channel)=>{

        this.setActiveChannel(channel)
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)
        this.setState({channel})

    }

    displayChannels = (channels)=>(
        channels.length > 0 && channels.map((channel)=>
        (
            <Menu.Item 
            onClick={()=>this.changeChannel(channel)}
            key={channel.id} 
            name={channel.name} 
            active={channel.id === this.state.activeChannel.id}
            style={{opacity:0.7}}>{'#'+ channel.name}</Menu.Item>
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
