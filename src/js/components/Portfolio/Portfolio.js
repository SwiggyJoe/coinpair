
  import React from "react";
  import UIkit from 'uikit';
  import { Link } from 'react-router-dom'
  import { connect } from "react-redux"

  import { push } from 'react-router-redux'

  import { mapStateToProps } from '../../reducers';

  import { getPriceInPersonalCurrencyExact } from '../../scripts/convert.js'

  import Table from './assetTable'

  Number.prototype.formatMoney = function(c, d, t){
  var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  };


  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Portfolio extends React.Component {
    constructor(props){
      super(props)

      this.state = {
        dataRequested: false,
        calculated: false,
        worth: 0,
        percentChangeWorth: 0,
      }

      setInterval(() => {
        this.setState({
          calculated: false
        })
      }, 2000)

    }

    componentWillMount(){

      const { socket }        = this.props.socket
      const { coin, auth }    = this.props

      if(typeof socket !== "undefined" && !this.state.dataRequested){

        socket.emit('getPortfolioDetails', {userID: auth.user.id})
        this.setState({dataRequested: true})

      }

    }

    componentDidUpdate(){
      const { socket }        = this.props.socket
      const { coin, auth, portfolio }    = this.props

      if(typeof portfolio.id !== "undefined" && this.state.calculated == false){

        let valueOfPortfolio  = 0
        let buyValue          = 0

        for (const asset of portfolio.assets){
          let index = coin.findIndex(x => x.id==asset.coinID);

          valueOfPortfolio +=  (coin[index].price_usd*asset.holding)
          buyValue         += (asset.holding * asset.buyPrice)
        }

        let percent = ((100/buyValue) * valueOfPortfolio) - 100

        this.setState({
          worth: valueOfPortfolio,
          percentChangeWorth: percent,
          calculated: true,
        })

      }


      if(typeof socket !== "undefined" && !this.state.dataRequested && auth.user.id !== ""){

        socket.emit('getPortfolioDetails', {userID: auth.user.id})
        this.setState({dataRequested: true})

      }
    }

    handleAssetClick(e, i){
      let clickedAsset = e

    }

    render() {
      const { config, coin, portfolio} = this.props

      let listItems
      if(typeof portfolio.id !== "undefined"){
        listItems = portfolio.assets.map((asset) => {
          let index = coin.findIndex(x => x.id==asset.coinID)
          let coinDetails = coin[index]

          let absoluteGain = (coinDetails.price_usd*asset.holding) - (asset.buyPrice*asset.holding)
          let percentGain = 100 / (asset.buyPrice*asset.holding) * (asset.holding * coinDetails.price_usd)

          let totalWorth = coinDetails.price_usd * asset.holding
          return (
            <li key={asset.assetID} onClick={this.handleAssetClick.bind(this, asset.assetID)}>
              <img src={"https://files.coinmarketcap.com/static/img/coins/32x32/"+asset.coinID+".png"}/>
              <h3 class="asset-name">
                <b>{coinDetails.name}</b>
              </h3>

              <h3 class="asset-price">
                <font>$</font>{getPriceInPersonalCurrencyExact(coinDetails.price_usd,config.currency)}
              </h3>

              <div class="asset-total">
                <font>$</font>{getPriceInPersonalCurrencyExact(totalWorth ,config.currency)}
              </div>



              <div class="asset-own">
                <h3><b>{asset.holding} {coinDetails.symbol}</b></h3>
                <h2>@ <font>{config.currency_symbol}</font>{getPriceInPersonalCurrencyExact(asset.buyPrice, config.currency)}</h2>
              </div>

              <div class="asset-gain">
                <h3><font>{config.currency_symbol}</font>{ absoluteGain.formatMoney(2, '.', ',') }</h3>
                <h2>{ percentGain.formatMoney(2, '.', ',') } <font>%</font></h2>
              </div>
            </li>
        )
        });
      }


      return (
        <div class="portfolio">



          <div class="header">
            <div class="header-left">
              <h1>Portfolio</h1>
              <h2>ADD DATE(16. Dezember, 2017)</h2>
            </div>

            <div class="header-right">
              <h1>
                <b><font>{this.props.config.currency_symbol}</font>
                {getPriceInPersonalCurrencyExact(this.state.worth, config.currency)}</b>
              </h1>
              <h2 style={Number(this.state.percentChangeWorth) > 0 ? {color: 'green'} : {color: 'red'}}>
                {this.state.percentChangeWorth.formatMoney(2, '.', ',')}%
              </h2>
            </div>
          </div>

          <div class="splitter"></div>

          <div class="uk-container content">
            <div class="uk-child-width-1-2" data-uk-grid>
              <div class=""></div>

              <div class="assets">

              <div class="nav-assets">
                <a>Current</a>
                <a>Sold</a>
              </div>

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

                {
                  listItems
                    }
                </ul>
              </div>

            </div>
          </div>


        </div>
      )
    }
  }
