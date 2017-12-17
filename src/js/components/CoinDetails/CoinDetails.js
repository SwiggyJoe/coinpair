
  import React from "react";
  import UIkit from 'uikit';
  import { Link } from 'react-router-dom'
  import { connect } from "react-redux"

  import Chart from '../Chart/Chart'
  import ChartPro from '../Chart/ChartPro'

  import { mapStateToProps } from '../../reducers';

  import { getPriceInPersonalCurrencyExact } from '../../scripts/convert.js'

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Coins extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        dataRequested: false,
        coinData: {}
      }
    }

    componentWillMount(){

      const { socket }  = this.props.socket
      const { coin }    = this.props

      if(typeof socket !== "undefined" && !this.state.dataRequested){

        socket.emit('getCoinDetails', {coinID: this.props.match.params.coinID})
        this.setState({dataRequested: true})

        let index = coin.findIndex(x => x.id==this.props.match.params.coinID);

        if(index != -1){
          let coinData = coin[index]

          if(this.state.coinData != coinData){
            console.log(coinData.price_usd)
            this.setState({ coinData })
          }

        }

      }

    }

    componentDidUpdate(){
      const { socket }  = this.props.socket
      const { coin }    = this.props

      if(typeof socket !== "undefined" && !this.state.dataRequested){
        socket.emit('getCoinDetails', {coinID: this.props.match.params.coinID})
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
