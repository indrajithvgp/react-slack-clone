import React, { Component } from 'react'
import firebase from '../../firebase'
import {Segment, Button, Input} from 'semantic-ui-react'
import FileModal from './FileModal'
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'

export class MessagesForm extends Component {
    state = {
        storageRef:firebase.storage().ref(),
        message:'',
        loading:false,
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        errors:[],
        modal:false,
        uploadState:'',
        uploadTask:null,
        percentUploaded:0
    }
    openModal = ()=> this.setState({modal:true})
    closeModal = ()=> this.setState({modal:false})
    handleChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
    }
    createMessage= (fileURL=null)=>{
        const message ={
            timestamp:firebase.database.ServerValue.TIMESTAMP,
            user:{
                id:this.state.user.uid,
                name:this.state.user.displayName,
                avatar:this.state.user.photoURL
            },
        }
        if(fileURL!==null){
            message['image'] = fileURL
        }else{
            message['content']=this.state.message
        }
        return message
    }
    sendMessage = ()=>{
        const {messagesRef} = this.props
        const {message, channel} = this.state
        if(message){
            this.setState({loading:true})
            messagesRef.child(channel.id).push().set(this.createMessage())
            .then(()=>{
                this.setState({loading:false, message:'', errors:[]})
            })
            .catch((err)=>{
                console.log(err)
                this.setState({loading:false, errors:[...this.state.errors, err]})
            })
        }else{
            this.setState({errors:this.state.errors.concat({message:"Add a message"})})
        }
    }
    uploadFile=(file, metaData)=>{
        const pathToUpload = this.state.channel.id
        const ref = this.props.messagesRef
        const filePath = `chat/public/${uuidv4()}`
        this.setState({
            uploadState:'uploading',
            uploadTask:this.state.storageRef.child(filePath).put(file, metaData)
        }, ()=>{
            this.state.uploadTask.on('state_changed', snap=>{
                const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes)*100)
                this.props.isProgressBarVisible(percentUploaded)
                this.setState({percentUploaded: percentUploaded})
            }, err=>{
                console.log(err)
                this.setState({erros:this.state.errors.concat(err), uploadState:'error', uploadTask:null})
            }, ()=>{
                this.state.uploadTask.snapshot.ref.getDownloadURL().then((downloadURL)=>{
                    this.sendFileMessage(downloadURL, ref, pathToUpload)
                })
                .catch(err=>{
                    console.log(err)
                    this.setState({erros:this.state.errors.concat(err), uploadState:'error', uploadTask:null})
                })
            })
        })
    }
    sendFileMessage=(fileURL, ref, pathToUpload)=>{
        ref.child(pathToUpload)
        .push()
        .set(this.createMessage(fileURL))
        .then(()=>{
            this.props.isProgressBarVisible(this.state.percentUploaded)
            this.setState({uploadState:'done'})
        })
        .catch(err=>{
                console.log(err)
                this.setState({errors:this.state.errors.concat(err)})
        })
    }
    render() {

        const {errors, message, loading, modal, percentUploaded, uploadState} = this.state

        return (
            <Segment className="messages__form">
                <Input fluid name="message" style={{marginBottom:'0.7em'}}
                label={<Button icon={'add'}/>}
                labelPosition ="left"
                value={message}
                onChange={this.handleChange}
                placeholder="Write your message"
                className={errors.some((e)=>e.message.includes('message')) ? 'error':''}
                />
                <Button.Group icon widths="2">
                    <Button
                        onClick ={this.sendMessage}
                        color="orange"
                        disabled={loading}
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"/>
                    <Button
                        color="teal"
                        onClick = {this.openModal}
                        disabled={uploadState==="uploading"}
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"/>
                </Button.Group>
                <FileModal modal={modal} uploadFile={this.uploadFile} closeModal={this.closeModal}/>
                <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded}/>
            </Segment>
        )
    }
}

export default MessagesForm
