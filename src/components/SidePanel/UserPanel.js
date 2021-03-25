import React, { Component } from 'react'
import AvatarEditor from 'react-avatar-editor'
import {Grid, Header, Icon, Dropdown, Image, Modal, Input, Button} from 'semantic-ui-react'
import firebase from '../../firebase'



export class UserPanel extends Component {

    state = {
        user: this.props.currentUser,
        modal:false,
        uploadedCroppedImage:"",
        previewImage:'',
        croppedImage:'',
        blob:'',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        usersRef: firebase.database().ref('users'),
        metadata:{
            contentTpe:'image/jpeg'
        }
    }

    openModal = ()=> this.setState({modal:true})
    closeModal = ()=> this.setState({modal:false})

    dropdownOptions=()=>[
        {
            text:<span>Signed In as <strong>{this.state.user.displayName}</strong></span>,
            key:"user",
            disabled:true
        },
        {
            text:<span onClick={this.openModal}>Change Avatar</span>,
            key:"avatar",
        },
        {
            text:<span onClick={this.handleSignOut}>Sign Out</span>,
            key:"signout",
        }
    ]

    handleSignOut = ()=>{
        firebase.auth().signOut()
    }

    handleChange = e => {
        const file = e.target.files[0]
        const reader = new FileReader()

        if(file){
            reader.readAsDataURL(file)
            reader.addEventListener('load', ()=>{
                this.setState({previewImage:reader.result})
            })
        }
    }

    handleCropImage = ()=>{
        if(this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob=>{
                let imageUrl=URL.createObjectURL(blob)
                this.setState({croppedImage:imageUrl, blob:blob})
            })
        }
    }

    uploadCroppedImage=()=>{
        const {storageRef, userRef,blob, metadata} = this.state
        storageRef.child(`avatars/user-${userRef.uid}`).put(blob, metadata)
        .then(snap=>snap.ref.getDownloadURL().then((downloadURL=>{
            this.setState({uploadedCroppedImage:downloadURL}, ()=>{
                this.changeAvatar()
            })
        })))
    }

    changeAvatar=()=>{
        this.state.userRef.updateProfile({
            photoURL:this.state.uploadedCroppedImage,
        }).then(()=>{
            console.log("photoURL updated")
            this.closeModal()
        }).catch(error=>{
            console.log("Error: ", error.message)
        })
        this.state.usersRef
        .child(this.state.userRef.uid)
        .update({avatar:this.state.uploadedCroppedImage})
        .then(()=>{
            console.log("UserAvatar Updated ..!")
        }).catch(error=>{
            console.log("Error: ", error.message)
        })
    }

    render() {
        const {user, modal, previewImage, croppedImage} = this.state
        return (
            <Grid style={{background:this.props.primaryColor}}>
                <Grid.Column>
                    <Grid.Row style={{padding:'1.2em', margin:0}}>
                        <Header inverted floated="left" as ="h2">
                        <Icon name ="code"/>
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                    <Header style={{padding:'0.25em'}} as="h4" inverted>
                        <Dropdown trigger={
                            <span>
                            <Image src={user.photoURL} spaced="right" avatar/>
                            {this.state.user.displayName}
                            </span>
                        } options={this.dropdownOptions()}/>
                    </Header>
                    </Grid.Row>
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>
                        Change Avatar
                        </Modal.Header>
                        <Modal.Content>
                        <Input fluid type="file" label="New Avatar" onChange={this.handleChange} name="previewImage"/>
                        <Grid centered stackable columns={2}>
                            <Grid.Row centered>
                                <Grid.Column className="ui center aligned grid">
                                {previewImage && (<AvatarEditor ref={node=>(this.avatarEditor = node)} image={previewImage} width={120} height={120}
                                    sclae={1.2}
                                    border={50}/>)}
                                </Grid.Column>
                                <Grid.Column>
                                {croppedImage && (<Image style={{margin:'3.5em auto'}} src={croppedImage} width={100} height={100}/>)}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                        {croppedImage && <Button color="green" onClick={this.uploadCroppedImage} inverted><Icon name="save"/>Change Avatar</Button>}
                        <Button color="green" inverted onClick={this.handleCropImage}><Icon name="image"/>Preview</Button>
                        <Button color="red" inverted onClick={this.closeModal}><Icon name="remove"/>Cancel</Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        )
    }
}

export default UserPanel
