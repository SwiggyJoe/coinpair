
  import React from 'react'

  // React Modules (Theme)
  import Navigation from "../Navigation"
  import Coins from "../Coins/Coins"
  import Updates from "../Updates/Updates"
  import Profile from "../Profile/Profile"

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
    console.log("YES")
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
          render={() => (auth.authenticated ? (<Coins />) : (<Login />))}
          />

          <Route exact path="/coin/:coinID"
          render={() => (auth.authenticated ? (<CoinDetails />) : (<Login />))}
          />

          <Route exact path="/coin/:coinID/:mode"
          render={() => (auth.authenticated ? (<CoinDetails />) : (<Login />))}
          />

          <Route exact path="/portfolio"
          render={() => (auth.authenticated ? (<div>Portfolio</div>) : (<Login />))}
          />

          <Route path="/updates"
          render={() => (auth.authenticated ? (<Updates />) : (<Login />))}
          />

          <Route path="/profile"
          render={() => (auth.authenticated ? (<Profile />) : (<Login />))}
          />

          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
        </div>
      )
    }
  }
