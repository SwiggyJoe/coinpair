import { combineReducers } from "redux"
import { routerReducer } from 'react-router-redux'

import socket from "./socketReducer"
import config from "./configReducer"
import generalMarket from "./generalMarketReducer"
import coin from "./coinReducer"
import coinTable from "./coinTableReducer"
import auth from "./authReducer"
import portfolio from "./portfolioReducer"


export const mapStateToProps = (state) => {
    return {
      socket:         state.socket,
      router:         state.routerReducer,
      config:         state.config,
      generalMarket:  state.generalMarket,
      coin:           state.coin,
      coinTable:      state.coinTable,
      auth:           state.auth,
      portfolio:      state.portfolio,
    }
}

export const reducers = combineReducers({
  routerReducer,
  socket,
  config,
  generalMarket,
  coin,
  coinTable,
  auth,
  portfolio,
 })
