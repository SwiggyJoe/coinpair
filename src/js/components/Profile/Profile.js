
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"

  import { push } from 'react-router-redux'

  import { unauth_user } from "../../actions/authActions"

  import { mapStateToProps } from '../../reducers';

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
      dispatch(unauth_user())
      dispatch(push('/login'))
    }
    render() {
      const { socket } = this.props
      return (
        <div class="Profile">
          <button onClick={this.handleLogout.bind(this)}>Logout</button>
        </div>
      )
    }
  }
