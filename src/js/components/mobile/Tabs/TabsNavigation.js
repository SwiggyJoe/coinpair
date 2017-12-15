
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink, Link } from 'react-router-dom'
  import { connect } from "react-redux"

  import { mapStateToProps } from '../../../reducers';

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Navigation extends React.Component {
    constructor(props){
      super(props)
    }

    render() {
      const { socket, config } = this.props
      return (
        <div class="TabsNavigation">
          <ul>
          <li onClick={() => {window.navigator.vibrate(50)}}>
            <NavLink activeClassName="none" to="/" style={socket.connected ? {color: '#24BD1B'} : {color: 'red'}}>•</NavLink>
          </li>

            <li onClick={() => {window.navigator.vibrate(50)}}>
              <NavLink exact to="/">Coins</NavLink>
            </li>

            <li onClick={() => {window.navigator.vibrate(50)}}>
              <NavLink to="/watch">Watchlist</NavLink>
            </li>

            <li onClick={() => {window.navigator.vibrate(50)}}>
              <NavLink to="/updates">Updates</NavLink>
            </li>

            <li onClick={() => {window.navigator.vibrate(50)}}>
              <NavLink to="/more">More</NavLink>
            </li>
          </ul>
        </div>
      )
    }
  }
