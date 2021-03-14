import React, { Component } from 'react'
import {Modal, Input, Button, Icon} from 'semantic-ui-react'
import mime from 'mime-types'

export class FileModal extends Component {

    state = {
        file:null,
        isAuthorized:['image/jpeg', 'image/png']
    }
    addFile=(e)=>{
        const file = e.target.files[0]
        if(file){
            this.setState({file})
        }
    }
    isAuthorized=(fileName)=>  this.state.isAuthorized.includes(mime.lookup(fileName))

    sendFile=()=>{
        const {file} = this.state
        console.log(this.state)
        const {uploadFile, closeModal} = this.props
        if(file!==null){
            if(this.isAuthorized(file.name)){
                const metaData = {contentType:mime.lookup(file.name)}
                uploadFile(file, metaData)
                closeModal()
                this.clearFile()
            }
        }
    }
    clearFile = ()=>this.setState({file:null})
    render() {
        const {modal, closeModal} = this.props

        return (
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Select an File</Modal.Header>
                <Modal.Content>
                    <Input
                    onChange={this.addFile}
                    fluid
                    label="File : [ .jpg .png ]"
                    name='File'
                    type="File"/>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.sendFile} color="green" inverted>
                        <Icon name="checkmark"/>Send
                    </Button>
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove"/>Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default FileModal

