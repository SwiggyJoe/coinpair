
  import React from 'react'

  // React Modules (Theme)
  import Navigation from "../Navigation"
  import Coins from "../Coins/Coins"
  import Updates from "../Updates/Updates"
  import CoinDetails from "../CoinDetails/CoinDetails"

  import Register from "../Register/Register"
  import Login from "../Login/Login"

  import { Route } from 'react-router'

  export default class FullWidthLayout extends React.Component {
    constructor(props){
      super(props)
    }
    render(){
      return (
        <div>
          <Navigation location={this.props.router} />

          <Route exact path="/" component={Coins} />
          <Route exact path="/coin/:coinID" component={CoinDetails} />
          <Route exact path="/coin/:coinID/:mode" component={CoinDetails} />
          <Route path="/updates" component={Updates} />

          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
        </div>
      )
    }
  }
