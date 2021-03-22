import React, { Component } from 'react'
import {Grid, Form, Segment, Header, Button, Message, Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom'
import firebase from '../../firebase'

export class Login extends Component {
    state={
        email:'',
        password:'',
        errors:[], 
        loading:false,
        usersRef: firebase.database().ref('users')
    }

    displayErrors = (errors)=> errors.map((error,i)=> <p key={i}>{error.message}</p>)


    handleChange = (e)=>{
        this.setState({[e.target.name]:e.target.value})
    }
    handleSubmit = (e)=>{
        const {email, password} = this.state
        e.preventDefault()
        if(this.isFormValid(this.state)){
            this.setState({errors:[], loading:true})
            firebase.auth().signInWithEmailAndPassword(email,password)
            .then(signedInUser => {
                console.log(signedInUser)
                this.setState({errors:[], loading:false})
            })
            .catch(error => {
                console.log(error)
                this.setState({errors:[...this.state.errors, error], loading: false})
            })

        }
        
    }
    isFormValid = ({email, password})=> email && password


    handleInputError = (errors, input)=>{
        return errors.some(error => error.message.toLowerCase().includes(input)) ? 'error' : ''
    }

    render() {
        const {email, password, errors, loading} = this.state
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet"/>
                        Login to DevChat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input value={email} fluid name="email" icon="mail" iconPosition="left"
                            placeholder="Email Address" onChange={this.handleChange} type="email"
                            className={this.handleInputError(errors, "email")}
                            />
                            <Form.Input value={password} fluid name="password" icon="lock" iconPosition="left"
                            placeholder="Password" onChange={this.handleChange} type="password"
                            className={this.handleInputError(errors, "password")}
                            />
                            <Button disabled={loading} className={loading ? 'loading' : ''} color="violet" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {this.state.errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Don't have an account? <Link to="/register">Register</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Login
