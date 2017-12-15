
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink, Link } from 'react-router-dom'
  import { connect } from "react-redux"

  import { changeViewCurrency } from "../../../actions/configActions"

  import { mapStateToProps } from '../../../reducers';

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

    render() {
      const { socket, config } = this.props
      return (
        <div class="More">

        <div class="uk-card uk-card-default uk-card-body uk-width-1-2@s">
            <ul class="uk-nav-default uk-nav-parent-icon" data-uk-nav>
                <li class="uk-nav-header">Menu</li>
                <li onClick={() => {window.navigator.vibrate(50)}}>
                  <NavLink to="/">Coin List</NavLink>
                </li>

                <li onClick={() => {window.navigator.vibrate(50)}}>
                  <NavLink to="/watch">Watchlist</NavLink>
                </li>
                
                <li onClick={() => {window.navigator.vibrate(50)}}>
                  <NavLink to="/updates">Updates</NavLink>
                </li>

                <li class="uk-nav-divider"></li>
                <li class="uk-nav-header">Settings</li>
                <li class="uk-parent">
                    <a href="#">{config.currency}</a>
                    <ul class="uk-nav-sub">
                        <li className={this.isActiveCurrency("USD")}>
                          <a href="#" onClick={() => {this.changeCurrency("USD", "$")}}>USD</a>
                        </li>
                        <li className={this.isActiveCurrency("EUR")}>
                          <a href="#" onClick={() => {this.changeCurrency("EUR", "€")}}>EUR</a>
                        </li>
                    </ul>
                </li>

                <li class="uk-parent">
                    <a href="#">Light Theme</a>
                    <ul class="uk-nav-sub">
                        <li><a href="#">Light Theme</a></li>
                        <li><a href="#">Dark Theme</a></li>
                    </ul>
                </li>

                <li class="uk-nav-divider"></li>

                <li class="uk-nav-header">Made in Germany</li>

            </ul>
        </div>


        </div>
      )
    }
  }
