
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"
  import { push } from 'react-router-redux'

  import { createPasswordHash } from "../../scripts/createPasswordHash"

  import { auth_user, add_user_details } from "../../actions/authActions"

  import Cookies from 'universal-cookie'
  const cookies = new Cookies();

  const ip = require('ip');

  // Redux Store setup
  @connect((store) => {
    return {
      socket: store.socket
    };
  })

  export default class Register extends React.Component {
    constructor(props){
      super(props)

      this.state = {
        username: "",
        password: "",
        passwordRe: "",
        mail: "",
        key: "",
        loading: false,
        error: false,
        errorMsg: "",

        requestMail: "",
        loadingRequest: false,

        errorRequest: false,
        errorRequestMsg: "",
        successRequest: false,

        socketSetup: false,
      }
    }

    componentDidUpdate() {
      const { socket }  = this.props.socket
      const { auth, dispatch }  = this.props

      // if user is already logged in
      // relocate to coinpair.me/
      if(typeof auth !== "undefined"){
        if(auth.authenticated){
          dispatch(push('/'))
        }
      }

      // if socket is set up
      // and isn't already set up
      if(typeof socket !== "undefined" && !this.state.socketSetup){
        this.setState({
          socketSetup: true,
        })

        // if received a callback from the server
        // if success redirect to home, stop loading
        // and display error if necessary

        socket.on('registerCallback', (data) => {
          this.setState({loading: false, error: !data.success, errorMsg: data.errorMsg})
          if(data.success){
            cookies.set('token', {token: data.token}, { path: '/' })
            this.props.dispatch(auth_user(data.token))
            this.props.dispatch(add_user_details(data.user))
            this.props.dispatch(push('/'))
          }
        })

        socket.on('requestInviteCallback', (data) => {
          console.log(data)
          this.setState({requestLoading: false, errorRequest: !data.success, errorRequestMsg: data.errorMsg})

          if(data.success){
            this.setState({successRequest: true})
          }
        })

      }

    }

    // functions to set the state variables
    handleUsername(e){
      this.setState({username: e.target.value})
    }
    handlePassword(e){
      this.setState({password: e.target.value})
    }
    handleRePassword(e){
      this.setState({passwordRe: e.target.value})
    }
    handleMail(e){
      this.setState({mail: e.target.value})
    }
    handleKey(e){
      this.setState({key: e.target.value})
    }
    _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
        this.handleRegister()
      }
    }

    handleRegister(){
      const { socket }  = this.props.socket
      const { username, password, passwordRe, mail, key } = this.state

      this.setState({
        loading: true
      })

      const setError = (errorMsg) => {
        this.setState({
          loading: false,
          error: true,
          errorMsg: errorMsg
        })
      }
      function validateEmail(email) {
          var re = /\S+@\S+\.\S+/;
          return re.test(email);
      }

      // check if everything is filled in
      if(username.length > 0 &&
        password.length > 0 &&
        passwordRe.length > 0 &&
        mail.length > 0 &&
        key.length > 0){

          // check if password is longer than 6 chars
          if(password.length >= 6 && password == passwordRe){

            // check if mail is valid
            if(validateEmail(mail)){

              // All client side checks are done sent to server
              let registerObject = {
                username,
                mail,
                password: createPasswordHash(password),
                key
              }
              socket.emit('registerAttempt', registerObject)

            }else{
              setError("Mail is not valid!")
            }

          }else{
            setError("Passwords don't match or are under 6 characters.")
          }

        }else{
          setError("Fill everything out.")
        }

    }

    handleRequest(){
      const { socket }  = this.props.socket

      this.setState({requestLoading: true})
      let mail = this.state.requestMail

      const setError = (msg) =>{
        this.setState({success: false, requestLoading: false, errorRequest: true, errorRequestMsg: msg})

      }
      const validateEmail = (email) => {
          var re = /\S+@\S+\.\S+/;
          return re.test(email);
      }

      if(mail.length > 0){
        if(validateEmail(mail)){
          let ipA = ip.address()
          console.log(ipA)
          socket.emit('inviteRequest', {mail, ip: ipA})

        }else{
          setError("Mail is not valid.")
        }
      }else{
        setError("Fill out the mail.")
      }

    }
    handleRequestMail(e){
        this.setState({requestMail: e.target.value})
    }
    _handleKeyPressRequest = (e) => {
    if (e.key === 'Enter') {
        this.handleRequest()
      }
    }



    render() {
      const { socket } = this.props
      return (
        <div>
          <div class="Register uk-container">
            <center>
              <h1>Start being part of CoinPair</h1>
              <p>
                We love that you want to join the Alpha Phase of Coinpair.
                <br/><b>If you do not have an invite code, request one here!</b>
              </p>

              <div class={!this.state.successRequest ? "message" : "message-success"} style={ this.state.errorRequest || this.state.successRequest ? {display: 'block'} : {display: 'none'}}>
                {this.state.successRequest ?  (<p>Success! We wish you luck!</p>) : (<p>Error: {this.state.errorRequestMsg}</p>)}
              </div>

              <div style={this.state.requestLoading || this.state.successRequest ? {display: 'none'} : {display: 'block'}}>
                <input
                  type="mail"
                  placeholder="Join@us.com"
                  onKeyPress={this._handleKeyPressRequest.bind(this)}
                  onChange={this.handleRequestMail.bind(this)}
                />

                <button class="request" onClick={this.handleRequest.bind(this)}><div>Request</div></button>
              </div>

              <div style={!this.state.requestLoading ? {display: 'none'} : {display: 'block'}}>
                Requesting..
              </div>

            </center>

          </div>

          <br/>

          <div class="splitter"></div>

          <br/>

          <div class="Register uk-container">
            <center>
              <h2>Already have an Invite-Key?</h2>
              <p>If you already have an invitey key you can register here.</p>
            </center>

            <div class="message" style={ this.state.error ? {display: 'block'} : {display: 'none'}}>
              <p>Error: {this.state.errorMsg}</p>
            </div>

            <div class="form">

            <div class="overlayForm" style={this.state.loading ? {display: "block"} : {display: "none"}}>
              <div class="loading"><i class="fa fa-circle-o-notch fa-spin"></i> Creating a new account..</div>
            </div>

            <div class="label">
              Username
            </div>
            <input
              type="text"
              placeholder="Username"
              onKeyPress={this._handleKeyPress.bind(this)}
              onChange={this.handleUsername.bind(this)}
            />

            <div class="label">
              Mail
            </div>
            <input
              type="mail"
              placeholder="enter@your.mail"
              onKeyPress={this._handleKeyPress.bind(this)}
              onChange={this.handleMail.bind(this)}
            />

            <div class="label">
              Password
            </div>
            <input
              type="password"
              placeholder="******"
              onKeyPress={this._handleKeyPress.bind(this)}
              onChange={this.handlePassword.bind(this)}
            />

            <div class="label">
              Re-Enter Password
            </div>
            <input
              type="password"
              placeholder="******"
              onKeyPress={this._handleKeyPress.bind(this)}
              onChange={this.handleRePassword.bind(this)}
            />


              <div class="label">
                Invite Key
              </div>
              <input
                type="text"
                class="key"
                maxLength="7"
                placeholder="Key"
                onKeyPress={this._handleKeyPress.bind(this)}
                onChange={this.handleKey.bind(this)}
              />

              <div class="information">
                <b>By pressing "Register", you accept the terms of use.</b>
              </div>

              <br/>
              <button class="register" onClick={this.handleRegister.bind(this)}>
                <div class="outer">
                  <div class="inner">Register</div>
                </div>
              </button>



            </div>

          </div>

        </div>
      )
    }
  }
