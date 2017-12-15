
  import React from 'react'

  // React Modules (Theme)
  import TabsNavigation from "../mobile/Tabs/TabsNavigation"
  import Coins from "../mobile/Coins/Coins"
  import Updates from "../Updates/Updates"
  import CoinDetails from "../CoinDetails/CoinDetails"
  import More from "../mobile/Tabs/More"

  import { Route } from 'react-router'

  export default class MobileWidthLayout extends React.Component {
    constructor(props){
      super(props)
    }
    render(){
      return (
        <div>
          <Route exact path="/" component={Coins} />
          <Route exact path="/coin/:coinID" component={CoinDetails} />
          <Route path="/updates" component={Updates} />

          <Route path="/more" component={More} />
          <TabsNavigation />
        </div>
      )
    }
  }
