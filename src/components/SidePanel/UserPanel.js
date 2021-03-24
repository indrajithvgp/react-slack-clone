import React, { Component } from 'react'
import {Grid, Header, Icon, Dropdown, Image} from 'semantic-ui-react'
import firebase from '../../firebase'



export class UserPanel extends Component {

    state = {
        user: this.props.currentUser
    }

    dropdownOptions=()=>[
        {
            text:<span>Signed In as <strong>{this.state.user.displayName}</strong></span>,
            key:"user",
            disabled:true
        },
        {
            text:<span>Change Avatar</span>,
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

    render() {
        const {user} = this.state
        return (
            <Grid style={{background:this.props.primaryColor}}>
                <Grid.Column>
                    <Grid.Row style={{padding:'1.2em', margin:0}}>
                        <Header inverted floated="left" as ="h2">
                        <Icon name ="code"/>
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                    </Grid.Row>
                    <Header style={{padding:'0.25em'}} as="h4" inverted>
                        <Dropdown trigger={
                            <span>
                            <Image src={user.photoURL} spaced="right" avatar/>
                            {this.state.user.displayName}
                            </span>
                        } options={this.dropdownOptions()}/>
                    </Header>
                </Grid.Column>
            </Grid>
        )
    }
}

export default UserPanel
