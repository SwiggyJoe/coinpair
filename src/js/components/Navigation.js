
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink, Link } from 'react-router-dom'
  import { connect } from "react-redux"
  import { push } from 'react-router-redux'

  import { changeViewCurrency } from "../actions/configActions"
  import { changeFilterTable } from '../actions/coinTableActions'

  import { store } from '../store'

  import { mapStateToProps } from '../reducers';

  //import mainLogo from '../../img/logo7.svg'

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })



  export default class Navigation extends React.Component {
    constructor(props){
      super(props)
    }
    changeCurrency = (currency, symbol) => {
      this.props.dispatch(changeViewCurrency(currency, symbol))
    }

    isActiveCurrency = (currency) => {
      return currency == this.props.config.currency ?  "uk-active" : ""
    }

    handleChange(e){
      this.props.dispatch(changeFilterTable(e.target.value))
    }

    render() {
      const { socket, config, coinTable } = this.props
      return (
        <div class="navigation">

        <Link to="/">
          <div class="logo">MiCoins</div>
        </Link>

        <Link to="/" style={socket.connected ? {color: '#24BD1B'} : {color: 'red'}}>
          <div class="socket-status">
            <div class="bullet" style={socket.connected ? {background: '#C5E1A5', borderColor: '#7CB342'} : {background: '#FABFBF', borderColor: '#C58585'}}></div>
            {socket.connected ? "Live Data" : "Not Connected"}
          </div>
        </Link>

        <div class="navigation-settings">
          <a class="head one"><i class="fa fa-sun-o"></i></a>
          <div data-uk-dropdown="pos: bottom-right; mode:click; boundary: .navigation">
            <ul class="uk-nav uk-dropdown-nav" style={{width: "100px"}}>
              <li class="uk-active"><a  href="#">Light <i class="fa fa-sun-o"></i></a></li>
              <li><a href="#">Dark <i class="fa fa-moon-o"></i></a></li>
            </ul>
          </div>

            <a class="head">{config.currency_symbol}</a>
            <div data-uk-dropdown="pos: bottom-center; mode:click; boundary: .navigation">
              <ul class="uk-nav uk-dropdown-nav" style={{width: "100px"}}>

                <li className={this.isActiveCurrency("USD")}>
                  <a href="#" onClick={() => {this.changeCurrency("USD", "$")}}>USD ($)</a>
                </li>

                <li className={this.isActiveCurrency("EUR")}>
                  <a href="#" onClick={() => {this.changeCurrency("EUR", "€")}}>EUR (€)</a>
                </li>

              </ul>
            </div>
        </div>

        <div class="navigation-user">

          <div class="navigation-user-login">
              <NavLink to="/login">Log In</NavLink>
          </div>

          <div class="navigation-user-register">
            <NavLink to="/register">Create an account</NavLink>
          </div>

        </div>

          <div class="navigation-nav">
            <ul>
              <li>
                <NavLink exact to="/">
                  Coins
                </NavLink>
              </li>

              <li>
                <NavLink to="/portfolio">
                  Portfolio
                </NavLink>
              </li>

              <li>
                <NavLink to="/updates">
                  Alpha
                </NavLink>
              </li>

            </ul>
          </div>



        </div>
      )
    }
  }
