
  import React from "react";
  import UIkit from 'uikit';
  import { Link } from 'react-router-dom'
  import { connect } from "react-redux"

  import Chart from '../Chart/Chart'
  import ChartPro from '../Chart/ChartPro'

  import { mapStateToProps } from '../../reducers';

  import { getPriceInPersonalCurrencyExact } from '../../scripts/convert.js'

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

  export default class Coins extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        dataRequested: false,
        coinData: {
          'id': '',
          'available_supply': 0,
          'max_supply': 0,
          '24h_volume_usd': 0,
          'market_cap_usd': 0,
          'percent_change_1h': 0,
          'percent_change_24h': 0,
          'percent_change_7d': 0
        }
      }
    }
    componentDidMount () {
        window.scrollTo(0, 0)
      }

    componentWillMount(){

      const { socket }  = this.props.socket
      const { coin }    = this.props



      if(typeof socket !== "undefined" && !this.state.dataRequested){

        socket.emit('getCoinDetails', {coinID: this.props.match.params.coinID, timeframe: 'DAY'})
        this.setState({dataRequested: true})

        let index = coin.findIndex(x => x.id==this.props.match.params.coinID);

        if(index != -1){
          let coinData = coin[index]

          if(this.state.coinData != coinData){
            this.setState({ coinData })
          }

        }

      }

    }

    componentDidUpdate(){
      const { socket }  = this.props.socket
      const { coin }    = this.props

      if(typeof socket !== "undefined" && !this.state.dataRequested){
        socket.emit('getCoinDetails', {coinID: this.props.match.params.coinID, timeframe: 'DAY'})
        this.setState({dataRequested: true})
      }

      let index = coin.findIndex(x => x.id==this.props.match.params.coinID);

      if(index != -1){
        let coinData = coin[index]

        if(this.state.coinData != coinData){
          this.setState({ coinData })
        }

      }

    }

    render() {
      const { socket, coin, config } = this.props

      return (
        <div class="coinDetails">
          <div class="header uk-container">

            <div class="header-left">

              <div class="coin-icon">
                <img src={"https://files.coinmarketcap.com/static/img/coins/64x64/"+this.state.coinData.id+".png"} />
              </div>

              <div class="coin-title">
                <h2>{this.state.coinData.name}</h2>
                <h3>[{this.state.coinData.symbol}]</h3>
              </div>

              <div class="coin-price">
                <h3>
                  <font>{config.currency_symbol}</font>
                  {getPriceInPersonalCurrencyExact(this.state.coinData.price_usd, config.currency)}
                </h3>
                <h2 style={this.state.coinData['percent_change_24h'] > 0 ? {color: 'green'} : {color: 'red'}}>
                {this.state.coinData['percent_change_24h']}%
                </h2>
              </div>

              </div>
            </div>


          <div class="splitter"></div>


          <div class="content">
            <div class="uk-container grid-wrapper">
              <div class="uk-child-width-expand@s" data-uk-grid>

                <div>
                  <h4>Market Cap</h4>
                  <h5><font>{config.currency_symbol}</font>{getPriceInPersonalCurrencyExact(this.state.coinData['market_cap_usd'], config.currency)}</h5>
                </div>

                <div>
                  <h4>Volume 24h</h4>
                  <h5><font>{config.currency_symbol}</font>{getPriceInPersonalCurrencyExact(this.state.coinData['24h_volume_usd'], config.currency)}</h5>
                </div>

                <div>
                  <h4>Available Supply</h4>
                  <h5>{Number(this.state.coinData['available_supply']).formatMoney(2,'.',',')}</h5>
                </div>

                <div>
                  <h4>Max Supply</h4>
                  <h5>{Number(this.state.coinData['max_supply']).formatMoney(2,'.',',')}</h5>
                </div>

              </div>

            </div>
          </div>

          <div class="splitter"></div>

          <div class="content">
            <div class="uk-container grid-wrapper">

              <div class="uk-child-width-expand@s" data-uk-grid>

                <div>
                  <h4>Percent Change 1h</h4>
                  <h5
                    style={Number(this.state.coinData['percent_change_1h']) > 0 ? {color: 'green'} : {color: 'red'}}>
                      {Number(this.state.coinData['percent_change_1h']).formatMoney(2,'.',',')} %
                  </h5>
                </div>

                <div>
                  <h4>Percent Change 24h</h4>
                  <h5
                    style={Number(this.state.coinData['percent_change_24h']) > 0 ? {color: 'green'} : {color: 'red'}}>
                      {Number(this.state.coinData['percent_change_24h']).formatMoney(2,'.',',')} %
                  </h5>
                </div>

                <div>
                  <h4>Percent Change 7d</h4>
                  <h5
                    style={Number(this.state.coinData['percent_change_7d']) > 0 ? {color: 'green'} : {color: 'red'}}>
                      {Number(this.state.coinData['percent_change_7d']).formatMoney(2,'.',',')} %
                  </h5>
                </div>

              </div>
            </div>
          </div>

          <div class="uk-container">
            {(() => {
                if(socket.connected){
                  return (<Chart activeCoin={this.state.coinData.id} socketProp={socket.socket} />)
                }
                else{
                  return(<div>Loading Chart..</div>)
                }
            })()}
          </div>

        </div>
      )
    }
  }

/*

            CD: {JSON.stringify(this.state.coinData)}

            <div class="selectChart">
              <Link to={'/coin/'+this.props.match.params.coinID}>Standard</Link>
              <Link to={'/coin/'+this.props.match.params.coinID+"/pro"}>Pro</Link>
            </div>

            {(() => {
              if(this.props.match.params.mode == "pro" && 1 == 2){
                return (<ChartPro />)
              }
              else{
                if(socket.connected && 1 == 2){
                  return (<Chart activeCoin={this.state.coinData.id} socketProp={socket.socket} />)
                }
                else{
                  return(<div>lol</div>)
                }
              }
            })()}

*/
