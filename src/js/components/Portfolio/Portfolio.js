
  import React from "react";
  import UIkit from 'uikit';
  import { Link } from 'react-router-dom'
  import { connect } from "react-redux"
  import { push } from 'react-router-redux'
  import { mapStateToProps } from '../../reducers';
  import { getPriceInPersonalCurrencyExact } from '../../scripts/convert.js'

  import DatePicker from 'react-datepicker'
  import 'react-datepicker/src/stylesheets/datepicker.scss'

  import Select from 'react-select'
  import 'react-select/scss/default.scss'

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

  let timer;

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
        coinOptions: [],
        socketSetup: false,
        newPortfolioData: false,

        coinSelectedBuy: "",
        buyWith: "USD",
        buyPrice: 0,
        buyDesc: "",
        buyAmount: 0,
        buyPriceTotal: false,
        buyDate: moment(),
        buyError: false,
        buyLoading: false,

      }

    }

    componentWillMount(){

      const { socket }        = this.props.socket
      const { coin, auth }    = this.props

      if(typeof socket !== "undefined" && !this.state.dataRequested){

        socket.emit('getPortfolioDetails', {userID: auth.user.id})
        this.setState({dataRequested: true})

      }

  /*    if(this.state.globalPositions !== []){

        let valueOfPortfolio  = 0
        let buyValue          = 0

        const globalPositions = this.state.globalPositions
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

*/
    }

    componentDidMount(){
      const { socket }        = this.props.socket
      const { coin, auth, portfolio }    = this.props

      timer = setInterval(() => {
        this.setState({
          calculated: false
        })
      }, 2000)

      let optionArray = []

      for (let i = 0; i < coin.length; i++){
        let optionObj = {
          value: coin[i].id,
          label: coin[i].name
        }
        optionArray.push(optionObj)
      }
      this.setState({ coinOptions: optionArray})


    }

    componentWillUnmount(){
      clearTimeout(timer)
    }

    componentDidUpdate(){
      const { socket }        = this.props.socket
      const { coin, auth, portfolio }    = this.props

      if(typeof socket !== "undefined" && !this.state.dataRequested && auth.user.id !== "" && coin != []){

        socket.emit('getPortfolioDetails', {userID: auth.user.id})

        let optionArray = []

        for (let i = 0; i < coin.length; i++){
          let optionObj = {
            value: coin[i].id,
            label: coin[i].name
          }
          optionArray.push(optionObj)
        }
        this.setState({dataRequested: true, coinOptions: optionArray})

      }
    }

    handleAssetClick(e, i){
      let clickedAsset = e

    }

    componentWillUpdate(){

      const { socket }        = this.props.socket
      const { coin, auth, portfolio }    = this.props

      if(typeof socket !== "undefined" && !this.state.socketSetup && auth.user.id !== ""){
        this.setState({socketSetup: true})
        socket.on('buyPortfolioCallback', (data) =>  {
          if(data.success){
            this.setState({
              coinSelectedBuy: "",
              buyWith: "USD",
              buyPrice: 0,
              buyDesc: "",
              buyAmount: 0,
              buyPriceTotal: false,
              buyDate: moment(),
              buyError: false,
              buyLoading: false
            })
            UIkit.modal(document.getElementById("buy-modal")).hide();
            UIkit.notification({message: 'Successfully saved.', status: 'success'})
            socket.emit('getPortfolioDetails', {userID: data.userID})
          }

        })
      }

      /*
        Goal here is to create a object for each coin
        with current holding & buy price.
      */

      if(typeof portfolio.id !== "undefined" ){

        if(!this.state.finishedGlobalPositions || this.state.globalPositionsLength !== portfolio.positions.length){

        let globalPositions = []
        let finishedCoins = []
        let globalPositionsLength = 0

       for(let i = 0; i < portfolio.positions.length; i++){
          let index       = coin.findIndex(x => x.id == portfolio.positions[i].coinID)
          let coinDetails = coin[index]

          globalPositionsLength++

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

              let buyPrice = position.buyPrice

              if(position.buyWith !== "USD"){
                buyPrice = buyPrice * position.currencyUsdWorth
              }

              for(let y = 0; y < sellsOfPosition.length; y++){
                currentValue -= sellsOfPosition[y].value
              }


              avgPrice == 0 ? avgPrice = buyPrice
              : avgPrice = (avgPrice*value+currentValue*buyPrice)/(value+currentValue)

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
        this.setState({
          finishedGlobalPositions: true,
          globalPositions,
          globalPositionsLength,
          newPortfolioData: false,
        })
        }
      }

      // HERE CALCULATING
      // END CALC

    }

    handleCoinSelect(selected){
      this.setState({ coinSelectedBuy: selected })
    }
    handleBuyPrice(e){
      this.setState({buyPrice: e.target.value})
    }
    handleBuyAmount(e){
      this.setState({buyAmount: e.target.value})
    }
    handleBuyDescription(e){
      this.setState({buyDesc: e.target.value})
    }
    handleBuyWith(event){
      this.setState({buyWith: event.target.value})
    }
    handleBuyPriceTotal(e){
      let state = e.target.value === "unit" ? false : true
      this.setState({buyPriceTotal: state})
    }

    handleBuyError(msg){
      UIkit.notification({message: msg, status: 'danger'})
    }

    handleBuyDate(value){
      this.setState({buyDate: value})
    }

    handleBuy(){
      const { socket }  = this.props.socket
      const { auth, coin }    = this.props

      let selectedCoinID  = this.state.coinSelectedBuy.value
      let price           = this.state.buyPrice
      let amount          = this.state.buyAmount
      let buyWith         = this.state.buyWith
      let desc            = this.state.buyDesc
      let priceInTotal    = this.state.buyPriceTotal
      let date            = this.state.buyDate

      // Check if everything is filled
      if(selectedCoinID !== "" &&price !== 0 &&
      amount !== 0 && buyWith !== "" && auth.authenticated){

        let sendObject = {
          coinID: selectedCoinID,
          price: Number(price),
          amount,
          buyWith,
          desc,
          priceInTotal,
          date,
          userID: auth.user.id,
          btcPriceUsd: coin[0].price_usd,
          token: auth.token.token
        }

        socket.emit('buyPortfolioEvent', sendObject)
      }
      else{
        this.handleBuyError("Fill everything required out.")
      }
    }

    render() {
      const { config, coin, portfolio} = this.props

      let valueOfPortfolio  = 0
      let buyValue          = 0
      let percent           = 0


        const globalPositions = this.state.globalPositions
        for (let i = 0; i < globalPositions.length; i++){
          let index         = coin.findIndex(x => x.id==globalPositions[i].coinID);
          buyValue          += globalPositions[i].value * globalPositions[i].avgPrice
          valueOfPortfolio  += (coin[index].price_usd*globalPositions[i].value)
        }

        percent = ((100/buyValue) * valueOfPortfolio) - 100

        /*this.setState({
          worth: valueOfPortfolio,
          percentChangeWorth: percent,
          calculated: true,
        })*/




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

            <h3 class="asset-price">
              <font>{this.props.config.currency_symbol}</font>
              {getPriceInPersonalCurrencyExact(coinDetails.price_usd, config.currency)}
            </h3>

            <div class="asset-gain">
              <h3><b>{asset.value} {coinDetails.symbol}</b></h3>
              <h2>@ <font>{config.currency_symbol}</font>{getPriceInPersonalCurrencyExact(asset.avgPrice, config.currency)}</h2>
            </div>

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
                {getPriceInPersonalCurrencyExact(valueOfPortfolio, config.currency)}</b>
              </h1>
              <h2 style={Number(percent) > 0 ? {color: 'green'} : {color: 'red'}}>
                {percent.formatMoney(2, '.', ',')}%
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
                    <button data-uk-toggle="target: #buy-modal"><div>Buy</div></button>
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

          <div id="buy-modal" data-uk-modal>
              <div class="uk-modal-dialog">
                  <button class="uk-modal-close-default" type="button" data-uk-close></button>
                  <div class="uk-modal-header">
                      <h2 class="uk-modal-title">Add A Buy</h2>
                  </div>
                  <div class="uk-modal-body">
                      <p>Here you can add a coin to your portfolio.</p>
                      <div class="uk-margin">

                      <form class="uk-grid-small" data-uk-grid>

                          <div class="uk-width-1-1">
                            <label class="uk-form-label" for="form-stacked-text">Coin</label>
                            <div class="uk-form-controls">
                            <Select
                                    name="form-field-name"
                                    value={this.state.coinSelectedBuy}
                                    onChange={this.handleCoinSelect.bind(this)}
                                    options={this.state.coinOptions}
                                  />
                            </div>
                          </div>

                          <div class="uk-width-1-4@s">
                            <label class="uk-form-label" for="form-stacked-text">Buy Price</label>
                            <div class="uk-form-controls">
                              <input
                                class="uk-input"
                                id="form-stacked-text"
                                type="text"
                                placeholder="Eg: 16439"
                                onChange={this.handleBuyPrice.bind(this)}
                                />
                            </div>
                          </div>

                          <div class="uk-width-1-4@s">
                            <label class="uk-form-label" for="form-stacked-text">Amount</label>
                            <div class="uk-form-controls">
                              <input
                                class="uk-input"
                                id="form-stacked-text"
                                type="text"
                                placeholder="Eg: 1.32"
                                onChange={this.handleBuyAmount.bind(this)}
                                />
                            </div>
                          </div>

                          <div class="uk-width-1-4@s">
                            <label class="uk-form-label" for="form-stacked-text">Bought With</label>
                            <div class="uk-form-controls">
                              <select
                                class="uk-select"
                                id="form-horizontal-select"
                                onChange={this.handleBuyWith.bind(this)} value={this.state.buyWith}
                                >
                                <option value="USD">USD</option>
                                <option value="BTC">BTC</option>
                              </select>
                            </div>
                          </div>

                          <div class="uk-width-1-4@s">
                            <label class="uk-form-label" for="form-stacked-text">Price Type</label>
                            <div class="uk-form-controls">
                              <select
                                class="uk-select"
                                id="form-horizontal-select"
                                onChange={this.handleBuyPriceTotal.bind(this)}
                                >
                                <option value="unit">Per Unit</option>
                                <option value="total">Total Value</option>
                              </select>
                            </div>
                          </div>

                          <div class="uk-width-1-2@s">
                            <label class="uk-form-label" for="form-stacked-text">Description</label>
                            <div class="uk-form-controls">
                              <input
                                class="uk-input"
                                id="form-stacked-text"
                                type="text"
                                placeholder="Optional description of this buy.."
                                onChange={this.handleBuyDescription.bind(this)}
                                />
                            </div>
                          </div>

                          <div class="uk-width-1-2@s">
                            <label class="uk-form-label" for="form-stacked-text">Buy Date</label>
                            <div class="uk-form-controls">
                            <DatePicker
                                className="uk-input"
                                selected={this.state.buyDate}
                                onChange={this.handleBuyDate.bind(this)}
                            />
                            </div>

                          </div>

                      </form>

                       </div>
                  </div>
                  <div class="uk-modal-footer uk-text-right">
                      <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                      <button
                        type="button"
                        className={"uk-button uk-button-primary"}
                        onClick={this.handleBuy.bind(this)}
                        >
                          Save Buy
                        </button>
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
