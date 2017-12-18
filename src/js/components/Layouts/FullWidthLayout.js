
  import React from 'react'

  // React Modules (Theme)
  import Navigation from "../Navigation"
  import Coins from "../Coins/Coins"
  import Updates from "../Updates/Updates"
  import Profile from "../Profile/Profile"
  import Portfolio from "../Portfolio/Portfolio"
  import Watchlist from "../Watchlist/Watchlist"

  import CoinDetails from "../CoinDetails/CoinDetails"

  import Register from "../Register/Register"
  import Login from "../Login/Login"

  import { Route } from 'react-router'

  import { connect } from "react-redux"
  import { push } from 'react-router-redux'
  import { store } from '../../store'
  import { mapStateToProps } from '../../reducers';

  import { auth_user } from "../../actions/authActions"

  import Cookies from 'universal-cookie'
  const cookies = new Cookies()

  let token = cookies.get('token')

  if(typeof token !== "undefined"){
    store.dispatch(auth_user(token))
  }

  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class FullWidthLayout extends React.Component {
    constructor(props){
      super(props)
    }
    componentWillMount(){
    }

    render(){
      const { auth, dispatch }  = this.props
      return (
        <div>
          <Navigation location={this.props.router} />

          <Route exact path="/"
          render={(props) => (auth.authenticated ? (<Coins {...props} />) : (<Login />))}
          />

          <Route exact path="/coin/:coinID"
          render={(props) => (auth.authenticated ? (<CoinDetails {...props} />) : (<Login />))}
          />

          <Route exact path="/coin/:coinID/:mode"
          render={(props) => (auth.authenticated ? (<CoinDetails {...props} />) : (<Login />))}
          />

          <Route exact path="/portfolio"
          render={(props) => (auth.authenticated ? (<Portfolio {...props} />) : (<Login />))}
          />
          <Route exact path="/portfolio/:config"
          render={(props) => (auth.authenticated ? (<Portfolio {...props} />) : (<Login />))}
          />

          <Route exact path="/watchlist"
          render={(props) => (auth.authenticated ? (<Watchlist {...props} />) : (<Login />))}
          />

          <Route path="/updates"
          render={(props) => (auth.authenticated ? (<Updates {...props} />) : (<Login />))}
          />

          <Route path="/profile"
          render={(props) => (auth.authenticated ? (<Profile {...props} />) : (<Login />))}
          />

          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
        </div>
      )
    }
  }
