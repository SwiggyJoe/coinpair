
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"

  // Redux Store setup
  @connect((store) => {
    return {
      socket: store.socket
    };
  })

  export default class Updates extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        dataRequested: false,
        bugs: ['Loading..'],
        features: [{desc: 'Loading..', votes: 0}],
        totalVotes: 0,
      }
    }
    componentWillMount(){
      const { socket }  = this.props.socket
      if(typeof socket !== "undefined" && !this.state.dataRequested){

        this.setState({
          dataRequested: true,
        })
        socket.emit('getUpdateDetails',{})
      }
    }
    componentDidUpdate(){
      const { socket }  = this.props.socket
      if(typeof socket !== "undefined" && !this.state.dataRequested){

        this.setState({dataRequested: true})
        socket.emit('getUpdateDetails', {})
      }


    }


    render() {
      const { socket }  = this.props.socket

      if(typeof socket !== "undefined" && true){
        socket.on('updateDetailsCallback', (data) => {

          let features = data.features
          features.sort((a,b) => {
            return a.votes < b.votes ? true : false
          })

          this.setState({
            bugs: data.bugs,
            features: features,
            totalVotes: data.totalVotes,
          })
        })
      }

      return (
        <div class="updates">
          <div class="header">
            <h1>CoinPair.it</h1>
            <h2>Version 0.1.0</h2>
          </div>

          <div class="about uk-container">
            <h2>About Us.</h2>
            <p>
              Out goals may be high, but we will and do work hard to achieve them.
              We try to offer the best go-to page for cryptocurrencies in the world.
              First we want to start with the service you can currently use like
              the coin overview coins or to see your net worth grow with our portfolio tool.
              <br/>
              But this is only the beginning. We have many plans from implementing community features
              to offering top notch analysis on coins.
              <br/>
              In order to do this, we want to grow steadily and increase our offerings one by one.
              We do not rush in things, we build something, make it awesome and then move to the
              next feature.
            </p>
          </div>

          <div class="current-status uk-container">
            <h2>BE AWARE!</h2>
            <p>
              We are currently in the <b>early</b> phase of this project. So it
              can happen that features do not work properly or are completely missing.
              Also there can be lots of bugs and we need you to tell us if you
              find something that is not correct.
            </p>

            <button><div>Report A Bug</div></button>
          </div>

          <div class="features uk-container">
            <h2>Planned Features</h2>
            <p>
              Here we have all our planned features. You can vote once a day
              for your feature. The feature with most votes gets developed the
              fastest.
            </p>

            <h3>1 Vote Left Today!</h3>

            <ul class="uk-list uk-list-divide">

              {
                this.state.features.map((feature, index) => {
                  let calcWidth = 100/this.state.totalVotes * feature.votes

                  return(
                    <li key={index}>
                      <div class="progress" style={{width:calcWidth+'%'}}></div>
                      <div class="content">
                        {feature.desc}
                        <div class="right">
                          {feature.votes} Votes
                        </div>
                      </div>
                    </li>
                  )
                })
              }


            </ul>

            <button><div>Request A Different Feature</div></button>
          </div>

          <div class="bugs uk-container">
            <h2>Known Bugs</h2>
            <p>
              Here are all currently known bugs, which will be fixed in the next update.
            </p>

            <ul class="uk-list uk-list-divide">
              {
                this.state.bugs.map((bug, index) => {

                  return (
                    <li key={index}>{bug}</li>
                  )

                  i++
                })
              }
            </ul>

            <button><div>Report A Bug</div></button>
          </div>

        </div>
      )
    }
  }
