import React from 'react'
import { render } from 'react-dom'
import { connect, Provider } from 'react-redux'
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'

import { createStore, applyMiddleware } from 'redux'
import createHistory from 'history/createBrowserHistory'

import logger from "redux-logger"
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"

import { Link } from 'react-router-dom'
import { Route, Switch } from 'react-router'

import reducer from "./reducers"

import Layout from './components/Layout'
import {history, store} from './store'


const ConnectedSwitch = connect(state => ({
  location: state.routerReducer.location
}))(Switch)


const App = connect(state => ({
  location: state.routerReducer.location,
}))(Layout)

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ConnectedSwitch>
        <App />
      </ConnectedSwitch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app'),
)
