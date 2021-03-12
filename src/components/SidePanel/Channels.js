import React, { Component } from 'react'
import { Menu, Icon, Modal, Form, Input , Button} from 'semantic-ui-react'
import firebase, {db} from '../../firebase'
import { v4 as uuidv4 } from 'uuid';

export class Channels extends Component {

    state = {
        user:this.props.currentUser,
        channels:[], 
        modal:false,
        channelName:"",
        channelDetails:'',
        channelsRef: db.collection('channels'),
    }

    componentDidMount(){
        this.addlisteners()
    }

    addlisteners=()=>{
        let loadedChannels = []
        // this.state.channelsRef.then(r=>console.log(r))
        this.state.channelsRef.get().then((r)=>console.log(r))
        // this.state.channelsRef.on('child_added', snap=>{
        //     loadedChannels.push(snap.val())
        //     console.log(loadedChannels)
        // })
    }


    addChannel = ()=>{
        const {channelsRef, channelName, channelDetails, user} = this.state
        const key = uuidv4();
        const newChannel = {
            id:key,
            name:channelName,
            details:channelDetails,
            createdBy: {
                name:user.displayName,
                avatar:user.photoURL
            }
        }
        channelsRef.doc(key).set(newChannel)        
        .then(()=>{
            this.setState({channelName:'', channelDetails:''})
            this.closeModal()
            console.log("DONE")
        }).catch(err=>{
            console.log(err)
        })
    }

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
            <>
            <Menu.Menu style={{paddingBottom:'2em'}}>
                <Menu.Item>
                    <span>
                        <Icon name="exchange"/>CHANNELS
                    </span>
                    ({channels.length})<Icon name='add' onClick={this.openModal}/>
                </Menu.Item>
            </Menu.Menu>
            <Modal basic open={modal} onClose={this.closeModal}>
                <Modal.Header>Add a Channel</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <Input
                        fluid
                        label="Name of Channel"
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
            </>
        )
    }
}

export default Channels
