
  import React from "react";
  import UIkit from 'uikit';
  import { Link } from 'react-router-dom'
  import { connect } from "react-redux"

  import { push } from 'react-router-redux'

  import { mapStateToProps } from '../../reducers';

  import { getPriceInPersonalCurrencyExact } from '../../scripts/convert.js'

  import Table from './assetTable'

  const moment    = require('moment')

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
        finishedGlobalPositions: false,
        calculated: false,
        worth: 0,
        percentChangeWorth: 0,
        globalPositions: [],
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

      if(typeof socket !== "undefined" && !this.state.dataRequested && auth.user.id !== ""){

        socket.emit('getPortfolioDetails', {userID: auth.user.id})
        this.setState({dataRequested: true})

      }
    }

    handleAssetClick(e, i){
      let clickedAsset = e

    }

    componentWillUpdate(){

      /*
        Goal here is to create a object for each coin
        with current holding & buy price.
      */

      const {
              portfolio,
              coin
            } = this.props

      if(typeof portfolio.id !== "undefined" && !this.state.finishedGlobalPositions){

        this.setState({
          finishedGlobalPositions: true,
        })

        console.log("YES")

        let globalPositions = []
        let finishedCoins = []

       for(let i = 0; i < portfolio.positions.length; i++){
          let index       = coin.findIndex(x => x.id == portfolio.positions[i].coinID)
          let coinDetails = coin[index]

          if(finishedCoins.indexOf(coinDetails.id) < 0){

            // Creates an Array with all positions of coin
            let allPositionsOfCoin = portfolio.positions.filter((obj) => {
              return obj.coinID == coinDetails.id ?  true : false
            })

            // now use this information to create a master position
            // with how many coins are hold and the average price
            /* @ Push into Array gloablPositions which will be later
            pushed into a state array
              Output: {
                coinID,
                value,
                avgBuyPrice
              }
            */
            let avgPrice = 0
            let value = 0

            for (let x = 0; x < allPositionsOfCoin.length; x++){

              let position = allPositionsOfCoin[x]
              let sellsOfPosition = position.sells

              let originalValue = position.originalValue
              let currentValue  = originalValue

              for(let y = 0; y < sellsOfPosition.length; y++){
                currentValue -= sellsOfPosition[y].value
              }


              avgPrice == 0 ? avgPrice = position.buyPrice
              : avgPrice = (avgPrice*value+currentValue*position.buyPrice)/(value+currentValue)

              value += currentValue
            }

            let pushIntoGlobalPositions = {
              coinID: coinDetails.id,
              value,
              avgPrice
            }

            globalPositions.push(pushIntoGlobalPositions)
            finishedCoins.push(coinDetails.id)
          }
          else{
            // COIN ALREADY FINISHED
          }
        }
        console.log(globalPositions)
        this.setState({
          globalPositions
        })

      }

      // HERE CALCULATING
      if(this.state.globalPositions !== [] && this.state.calculated == false){

        let valueOfPortfolio  = 0
        let buyValue          = 0



        const globalPositions = this.state.globalPositions
          console.log(this.state.globalPositions)
            console.log(globalPositions)
        for (let i = 0; i < globalPositions.length; i++){
          let index         = coin.findIndex(x => x.id==globalPositions[i].coinID);
          buyValue          += globalPositions[i].value * globalPositions[i].avgPrice
          valueOfPortfolio  += (coin[index].price_usd*globalPositions[i].value)
        }

        let percent = ((100/buyValue) * valueOfPortfolio) - 100

        this.setState({
          worth: valueOfPortfolio,
          percentChangeWorth: percent,
          calculated: true,
        })

      }
      // END CALC

    }

    render() {
      const { config, coin, portfolio} = this.props

      let listItems

      listItems = this.state.globalPositions.map((asset) => {
        let index = coin.findIndex(x => x.id==asset.coinID)
        let coinDetails = coin[index]

        return (
          <li key={asset.coinID} onClick={this.handleAssetClick.bind(this, asset.coinID)}>
            <img src={"https://files.coinmarketcap.com/static/img/coins/32x32/"+asset.coinID+".png"}/>
            <h3 class="asset-name">
              <b>{coinDetails.name}</b>
            </h3>

            <div class="asset-own">
              <h3><b>{asset.value} {coinDetails.symbol}</b></h3>
              <h2>@ <font>{config.currency_symbol}</font>{getPriceInPersonalCurrencyExact(asset.avgPrice, config.currency)}</h2>
            </div>

          </li>
        )
      })


      return (
        <div class="portfolio">



          <div class="header">
            <div class="header-left">
              <h1>Portfolio</h1>
              <h2>{moment().format("D. MMMM, YYYY")}</h2>
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
                    <button><div>Buy</div></button>
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


/*

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



*/
