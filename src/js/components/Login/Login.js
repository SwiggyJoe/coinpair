
  import React from "react";
  import UIkit from 'uikit';
  import { Link } from 'react-router-dom'
  import { connect } from "react-redux"
  import { push } from 'react-router-redux'

  import { createPasswordHash } from "../../scripts/createPasswordHash"

  import { auth_user, add_user_details } from "../../actions/authActions"

  import Cookies from 'universal-cookie'
  const cookies = new Cookies();

  // Redux Store setup
  @connect((store) => {
    return {
      socket: store.socket
    };
  })

  export default class Login extends React.Component {
    constructor(props){
      super(props)

      this.state = {
        username: "",
        password: "",
        loading: false,
        error: false,
        socketSetup: false,
      }



    }

    componentDidUpdate() {
      const { socket }  = this.props.socket
      const { auth, dispatch }  = this.props

      let token = cookies.get('token')

      if(typeof auth !== "undefined"){
        if(auth.authenticated){
          dispatch(push('/'))
        }
      }

      if(typeof socket !== "undefined" && !this.state.socketSetup){
        this.setState({
          socketSetup: true,
        })
        socket.on('loginCallback', (data) => {
          this.setState({loading: false, error: !data.success})
          if(data.success){
            cookies.set('token', {token: data.token}, { path: '/' })
            this.props.dispatch(auth_user(data.token))
            this.props.dispatch(add_user_details(data.user))
            this.props.dispatch(push('/'))
          }
        })
      }

    }

    handleUsername(e){
      this.setState({username: e.target.value})
    }
    handlePassword(e){
      this.setState({password: createPasswordHash(e.target.value)})
    }
    handleLogin(){
      const { socket }  = this.props.socket
      if(this.state.username.length > 0 && this.state.password.length > 0 && !this.state.loading )
      {
        this.setState({loading: true})
        socket.emit('loginAttempt', {username: this.state.username, password: this.state.password})
      }
    }

    _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
        this.handleLogin()
      }
    }

    render() {
      const { socket } = this.props
      return (
        <div>
          <div class="Login uk-container">
            <center>
              <h1>Login</h1>
              <p>
                Welcome back!
              </p>
            </center>

            <div class="form">
            <div class="overlayForm" style={this.state.loading ? {display: "block"} : {display: "none"}}>
              <div class="loading"><i class="fa fa-circle-o-notch fa-spin"></i> Logging in..</div>
            </div>
              <div class="label">
                Username or E-Mail
              </div>
              <input type="text" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.handleUsername.bind(this)} placeholder="Username or Mail"/>

              <div class="label">
                Password
              </div>
              <input type="password" onKeyPress={this._handleKeyPress.bind(this)} onChange={this.handlePassword.bind(this)} placeholder="******"/>

              <br/>
              <br/>
              <button
                class="request"
                onClick={this.handleLogin.bind(this)}
                >
                <div>
                  Login
                </div>
              </button>

              <div class="downLogin" >
                <Link to="Forgot">Forgot Password?</Link>
                <Link className="right" to="Register">Dont have an Account?</Link>
              </div>

            </div>

            <div class="message" style={ this.state.error ? {display: 'block'} : {display: 'none'}}>
              <p>Error: Username or password are invalid.</p>
            </div>

          </div>
        </div>
      )
    }
  }
