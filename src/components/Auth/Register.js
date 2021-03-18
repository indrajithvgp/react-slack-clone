import React, { Component } from 'react'
import {Grid, Form, Segment, Header, Button, Message, Icon} from 'semantic-ui-react'
import md5 from 'md5'
import {Link} from 'react-router-dom'
import firebase, {db} from '../../firebase'

export class Register extends Component {
    state={
        username:'',
        email:'',
        password:'',
        passwordConfirmation:'',
        errors:[], 
        loading:false,
        usersRef: firebase.database().ref('users')
    }

    isFormValid=()=>{
        let errors = []
        let error

        if(this.isFormEmpty(this.state)){
            error = {message:"Fill in all fields"}
            this.setState({errors: errors.concat(error)})
            return false
        }else if(!this.isPasswordValid(this.state)){
            error = {message:"Password is invalid"}
            this.setState({errors: errors.concat(error)})
            return false
        }else{
            return true
        }
    }

    isPasswordValid = ({password, passwordConfirmation})=> {
        if(password.length < 6 || passwordConfirmation.length < 6){
            return false
        }else if(password !== passwordConfirmation){
            return false
        }else{
            return true
        }
    }

    displayErrors = (errors)=> errors.map((error,i)=> <p key={i}>{error.message}</p>)

    isFormEmpty = ({username, email, password, passwordConfirmation})=>{
        return !username.length || !email.length || !password.length || !passwordConfirmation
    }

    handleChange = (e)=>{
        this.setState({[e.target.name]:e.target.value})
    }
    handleSubmit = (e)=>{
        const {email, password} = this.state
        e.preventDefault()
        if(this.isFormValid()){
            this.setState({errors:[], loading:true})
            firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(createdUser=>{
                console.log(createdUser)
                createdUser.user.updateProfile({
                    displayName:this.state.username,
                    photoURL:`http://gravatar.com/avatar/${md5(createdUser.user.email)}?d-identicon`
                }).then(()=>{
                    this.saveUser(createdUser).then(()=>{
                        this.setState({loading:false})
                    })
                }).catch(error=>{
                    console.log(error)
                    this.setState({errors:[...this.state.errors, error], loading:false})
                })
                
            }).catch(error=>{
            console.log(error)
            this.setState({errors:[...this.state.errors, error], loading:false})
            })
        }
        
    }

    saveUser = (createdUser)=>{
        // return db.collection('users').doc(createdUser.user.uid).set({
        //     name: createdUser.user.displayName,
        //     avatar: createdUser.user.photoURL
        // })
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        })
    }
    handleInputError = (errors, input)=>{
        return errors.some(error => error.message.toLowerCase().includes(input)) ? 'error' : ''
    }

    render() {
        const {username, email, password, passwordConfirmation, errors, loading} = this.state
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange"/>
                        Register for DevChat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input value={username} fluid name="username" icon="user" iconPosition="left"
                            placeholder="Username" onChange={this.handleChange} type="text"
                            className={this.handleInputError(errors, "username")}
                            />
                            <Form.Input value={email} fluid name="email" icon="mail" iconPosition="left"
                            placeholder="Email Address" onChange={this.handleChange} type="email"
                            className={this.handleInputError(errors, "email")}
                            />
                            <Form.Input value={password} fluid name="password" icon="lock" iconPosition="left"
                            placeholder="Password" onChange={this.handleChange} type="password"
                            className={this.handleInputError(errors, "password")}
                            />
                            <Form.Input value={passwordConfirmation} fluid name="passwordConfirmation" icon="repeat" iconPosition="left"
                            placeholder="Password Confirmation" onChange={this.handleChange} type="password"
                            className={this.handleInputError(errors, "password")}
                            />
                            <Button disabled={loading} className={loading ? 'loading' : ''} color="orange" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {this.state.errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Already a user? <Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Register
