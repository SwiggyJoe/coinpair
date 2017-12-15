import { applyMiddleware, createStore } from "redux"

import logger from "redux-logger"
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"

import { reducers } from "./reducers"

import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'


export const history = createHistory()

const middleware = applyMiddleware(routerMiddleware(history), promise(), thunk, logger, )

export const store = createStore(reducers, middleware)
