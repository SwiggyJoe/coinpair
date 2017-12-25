
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"

  import { push } from 'react-router-redux'

  import { unauth_user } from "../../actions/authActions"

  import { mapStateToProps } from '../../reducers';

  import Cookies from 'universal-cookie'
  const cookies = new Cookies();

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Profile extends React.Component {
    constructor(props){
      super(props)
    }
    handleLogout(e){
      const { socket, auth, dispatch } = this.props
      socket.socket.emit('logoutEvent', {token: auth.token})
      cookies.remove('token')
      dispatch(unauth_user())
      dispatch(push('/login'))
    }
    render() {
      const { socket, auth } = this.props
      return (
        <div class="Profile">

          <div class="header">
            <h1>{auth.user.username}</h1>
            <h2>{auth.user.details.mail}</h2>
            <div class="header-nav">
            </div>
          </div>

          <center>
          <button onClick={this.handleLogout.bind(this)}>Logout</button>
          </center>
        </div>
      )
    }
  }
