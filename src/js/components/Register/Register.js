
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"

  // Redux Store setup
  @connect((store) => {
    return {
      socket: store.socket
    };
  })

  export default class Register extends React.Component {
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
              <input type="mail" placeholder="Join@us.com"/>
              <button class="request"><div>Request</div></button>
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

            <div class="form">

            <div class="label">
              Username
            </div>
            <input type="text" placeholder="Username"/>

            <div class="label">
              Mail
            </div>
            <input type="mail" placeholder="enter@your.mail"/>

            <div class="label">
              Password
            </div>
            <input type="password" placeholder="******"/>

            <div class="label">
              Re-Enter Password
            </div>
            <input type="password" placeholder="******"/>


              <div class="label">
                Invite Key
              </div>
              <input type="text" class="key" maxLength="7" placeholder="Key"/>

              <div class="information">
                <b>By pressing "Register", you accept the terms of use.</b>
              </div>

              <br/>
              <button class="register">
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
