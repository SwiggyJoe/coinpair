
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"

  import { push } from 'react-router-redux'

  import { mapStateToProps } from '../../reducers';

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Profile extends React.Component {
    constructor(props){
      super(props)
    }
    render() {
      const { socket } = this.props
      return (
        <div class="portfolio">

          <div class="header">
            <div class="header-left">
              <h1>Portfolio</h1>
              <h2>16. Dezember, 2017</h2>
            </div>

            <div class="header-right">
              <h1><b><font>$</font>63.542</b></h1>
              <h2 style={{color: 'green'}}>+5.42%</h2>
            </div>
          </div>

          <div class="splitter"></div>

          <div class="uk-container content">
            <div class="uk-child-width-1-2" data-uk-grid>
              <div class="">Test</div>

              <div class="assets">

                <div class="header-assets">

                  <div class="title">
                    <h2>Assets</h2>
                    <h3>Click on an asset to expand</h3>
                  </div>

                  <div class="add-asset">
                    <button><div>Add Asset</div></button>
                  </div>

                </div>

                <hr/>
                <ul>
                  <li>
                    <img src="https://files.coinmarketcap.com/static/img/coins/32x32/bitcoin.png"/>
                    <h3 class="asset-name">
                      <b>Bitcoin</b>
                    </h3>

                    <h3 class="asset-price">
                      <font>$</font>19.543
                    </h3>

                    <h3 class="asset-absolute">
                      <font>$</font>8.438
                    </h3>

                    <h3 class="asset-percent">
                      128.43 <font>%</font>
                    </h3>

                    <div class="asset-own">
                      <h3><b>1.32 BTC</b></h3>
                      <h2>@ <font>$</font>6.538</h2>
                    </div>

                  </li>

                  <li>
                    <img src="https://files.coinmarketcap.com/static/img/coins/32x32/ethereum.png"/>
                    <h3 class="asset-name">
                      <b>Ethereum</b>
                    </h3>

                    <h3 class="asset-price">
                      <font>$</font>674.32
                    </h3>

                    <h3 class="asset-absolute">
                      <font>$</font>15.230
                    </h3>

                    <h3 class="asset-percent">
                      64.32 <font>%</font>
                    </h3>

                    <div class="asset-own">
                      <h3><b>489.12 ETH</b></h3>
                      <h2>@ <font>$</font>418.21</h2>
                    </div>

                  </li>
                </ul>
              </div>

            </div>
          </div>


        </div>
      )
    }
  }
