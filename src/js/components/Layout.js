
  // Important Libraries
  import React from 'react'
  import { render } from 'react-dom'
  import { connect, Provider } from 'react-redux'
  import { ConnectedRouter } from 'react-router-redux'
  import { Route, Switch } from 'react-router'

  // Actions
  import { socketConnected, socketDisconnected } from "../actions/socketActions"
  import { newConnGeneralMarketData } from "../actions/generalMarketActions"
  import { newConnCoinDataSimple } from "../actions/coinActions"
  import { changeViewLayout } from "../actions/configActions"
  import { unauth_user, add_user_details } from "../actions/authActions"
  import { newPortfolioData } from "../actions/portfolioActions"

  // Layouts
  import FullWidthLayout from "./Layouts/FullWidthLayout"
  import MobileWidthLayout from "./Layouts/MobileWidthLayout"

  import { mapStateToProps } from '../reducers';




  //SCSS Declaration
  const widthMobile = 900

  // Socket IO
  //const socket = require('socket.io-client')('http://192.168.2.102:8000')

  //const socket = require('socket.io-client')('http://192.168.178.43:8000')
  const socket = require('socket.io-client')('http://localhost:8000')

  const ConnectedSwitch = connect(state => ({
    location: state.routerReducer.location
  }))(Switch)

  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Layout extends React.Component {
    constructor(props){
      super(props)

      const { dispatch, config, auth } = this.props

      socket.on('connect',() => {
        dispatch(socketConnected(socket))
        if(auth.authenticated){
          socket.emit('isTokenLegit', {token: auth.token})
        }
      })
      socket.on('disconnect',() => {
        dispatch(socketDisconnected())
      })
      socket.on('newConnGMData', (val) => {
        dispatch(newConnGeneralMarketData (val))
      })
      socket.on('newConnSimpleCoinData', (val) => {
        dispatch(newConnCoinDataSimple (val))
      })

      socket.on('newPortfolioData', (val) => {
        dispatch(newPortfolioData(val))
      })

      socket.on('isTokenLegitCallback', (val) => {
        if(!val.isLegit){
          dispatch(unauth_user())
        }
        else{
          dispatch(add_user_details(val.user))
        }
      })

      document.getElementsByTagName("BODY")[0].onresize = () => {
        if(window.innerWidth > widthMobile){
          this.props.dispatch(changeViewLayout("FULL"))
        }
        else{
          this.props.dispatch(changeViewLayout("MOBILE"))
        }
      }
      if(window.innerWidth > widthMobile){
        this.props.dispatch(changeViewLayout("FULL"))
      }else{
        this.props.dispatch(changeViewLayout("MOBILE"))
      }

    }

    componentWillUpdate(){
      const { dispatch, config } = this.props

      if(config.theme == "LIGHT"){
        console.log("LIGHT")
        require('../../scss/index.scss')

      } else if(config.theme == "DARK"){
        require('../../scss/dark/index.scss')
      }

      if(config.layout == "MOBILE"){
        require('../../scss/mobile/index.scss')
      }

    }



    render() {
      const { config, auth } = this.props
      return (
        <div>
          { config.layout == "FULL" ? (<FullWidthLayout />) : (<MobileWidthLayout />)  }
        </div>
      )

    }
  }
