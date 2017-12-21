
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"

  import { mapStateToProps } from '../../reducers';


  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Updates extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        dataRequested: false,
        bugs: ['Loading..'],
        features: [{desc: 'Loading..', votes: 0}],
        totalVotes: 0,
        leftVotes: 0,
        bugInput: '',
        bugReportLoading: false,
        featureInput: '',
        featureRequestLoading: false,
        socketSetup: false,
      }
    }
    componentWillUpdate(){
      const { socket }    = this.props.socket
      if(typeof socket !== "undefined" && true){

      }
    }

    componentWillMount(){
      const { socket }  = this.props.socket

      if(typeof socket !== "undefined" && !this.state.dataRequested && this.props.auth.user.id !== ""){
        this.setState({
          dataRequested: true,
        })
        socket.emit('getUpdateDetails',{userID: this.props.auth.user.id})
      }
    }
    componentDidUpdate(){
      const { socket }  = this.props.socket
      if(typeof socket !== "undefined" && !this.state.dataRequested && this.props.auth.user.id !== ""){

        this.setState({dataRequested: true})
        socket.emit('getUpdateDetails', {userID: this.props.auth.user.id})
      }

      if(typeof socket !== "undefined" && !this.state.socketSetup){
        this.setState({socketSetup: true})

        socket.on('updateDetailsCallback', (data) => {

          let features = data.features
          features.sort((a,b) => {
            return a.votes < b.votes ? true : false
          })

          this.setState({
            bugs: data.bugs,
            features: features,
            totalVotes: data.totalVotes,
            leftVotes: data.leftVotes
          })
        })

        socket.on('reportBugCallback', (data) => {
          if(data.success){
            UIkit.modal(document.getElementById("report-bug-modal")).hide();
            UIkit.notification({message: 'Thank you!', status: 'success'})
            this.setState({bugInput: "", bugReportLoading: false})
          }else{
            UIkit.notification({message: 'Something went wrong', status: 'danger'})
          }
        })

        socket.on('requestFeatureCallback', (data) => {
          if(data.success){
            UIkit.modal(document.getElementById("request-feature")).hide();
            UIkit.notification({message: 'Thank you!', status: 'success'})
            this.setState({featureInput: "", featureRequestLoading: false})
          }else{
            UIkit.notification({message: 'Something went wrong', status: 'danger'})
          }
        })


      }
    }

    handleVote(index){
      const { socket }    = this.props.socket
      const { auth }      = this.props

      let totalVotes      = this.state.totalVotes
      let leftVotes       = this.state.leftVotes
      let features        = this.state.features

      let feature         = features[index]

      if(leftVotes > 0){
        leftVotes--
        totalVotes++
        feature.votes++

        socket.emit('voteEvent', {userID: auth.user.id, featureID: feature.id})

        features.sort((a,b) => {
          return a.votes < b.votes ? true : false
        })
        this.setState({
          features,
          leftVotes,
          totalVotes,
        })
      }


    }

    handleBugInput(e){
      this.setState({
        bugInput: e.target.value
      })
    }
    handleBugReport(){
      const { socket }    = this.props.socket
      const { auth }      = this.props

      if(this.state.bugInput.length > 10 && !this.state.bugReportLoading){
        this.setState({bugReportLoading:true})

        let userID    = auth.user.id
        let desc      = this.state.bugInput
        let userAgent = navigator.userAgent + " ||| "+ navigator.vendor

        let object    = {
          userID,
          desc,
          userAgent
        }
        socket.emit('reportBugEvent', object)
      }
      else{
        UIkit.notification({message: 'Please write more. (10 Characters at least)', status: 'warning'})
      }
    }

    handleFeatureInput(e){
      this.setState({
        featureInput: e.target.value
      })
    }
    handleFeatureRequest(){
      const { socket }    = this.props.socket
      const { auth }      = this.props

      if(this.state.featureInput.length > 10 && !this.state.featureRequestLoading){
        this.setState({featureRequestLoading:true})

        let userID    = auth.user.id
        let desc      = this.state.featureInput

        let object    = {
          userID,
          desc,
        }
        socket.emit('requestFeatureEvent', object)
      }
      else{
        UIkit.notification({message: 'Please write more. (10 Characters at least)', status: 'warning'})
      }
    }


    render() {

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

            <button data-uk-toggle="target: #report-bug-modal"><div>Report A Bug</div></button>
          </div>

          <div class="features uk-container">
            <h2>Planned Features</h2>
            <p>
              Here we have all our planned features. You can vote once a day
              for your feature. The feature with most votes gets developed the
              fastest.
            </p>

            <h3>
             {this.state.leftVotes > 0 ? (<div>
               {this.state.leftVotes} Vote(s) Left Today!
             </div>)
               :
               (<div>Thanks for shaping the future.</div>) }
            </h3>

            <ul class="uk-list uk-list-divide">

              {
                this.state.features.map((feature, index) => {
                  let calcWidth = 100/this.state.totalVotes * feature.votes

                  return(
                    <li
                      key={index}
                      onClick={() => {this.handleVote(index)}}
                      className={this.state.leftVotes < 1 ? "no-votes-li" : ""}
                      >
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

            <button data-uk-toggle="target: #request-feature"><div>Request A Different Feature</div></button>
          </div>

          <div class="bugs uk-container">
            <h2>Known Bugs</h2>
            <p>
              Here are all currently known bugs, which will be fixed in the next update.
            </p>

            <ul class="uk-list uk-list-bullet">
              {
                this.state.bugs.map((bug, index) => {

                  return (
                    <li key={index}>{bug}</li>
                  )

                  i++
                })
              }
            </ul>

            <button data-uk-toggle="target: #report-bug-modal">
              <div>Report A Bug</div>
            </button>
          </div>

          <div id="report-bug-modal" data-uk-modal>
              <div class="uk-modal-dialog">
                  <button class="uk-modal-close-default" type="button" data-uk-close></button>
                  <div class="uk-modal-header">
                      <h2 class="uk-modal-title">Report A Bug</h2>
                  </div>
                  <div class="uk-modal-body">
                      <p>Please report as detailed as much your problem. This helps us fixing it faster.</p>
                      <div class="uk-margin">
                           <textarea value={this.state.bugInput} disabled={this.state.bugReportLoading ? true : false} onChange={this.handleBugInput.bind(this)} class="uk-textarea" rows="5" placeholder="What is the bug about?"></textarea>
                       </div>
                  </div>
                  <div class="uk-modal-footer uk-text-right">
                      <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                      <button
                        onClick={this.handleBugReport.bind(this)}
                        type="button"
                        disabled={this.state.bugReportLoading ? true : false}
                        className={"uk-button uk-button-primary"}>
                          {this.state.bugReportLoading ? "Sending .." : "Send"}
                        </button>
                  </div>
              </div>
          </div>

          <div id="request-feature" data-uk-modal>
              <div class="uk-modal-dialog">
                  <button class="uk-modal-close-default" type="button" data-uk-close></button>
                  <div class="uk-modal-header">
                      <h2 class="uk-modal-title">Request A Feature</h2>
                  </div>
                  <div class="uk-modal-body">
                      <p>
                        Awesome that you have something in mind which could possibly make CoinPair better!
                        Please share it with us in as much details as you can.
                        Do not worry if it is only a short idea, we will take everything into consideration!
                      </p>
                      <div class="uk-margin">
                           <textarea class="uk-textarea" value={this.state.featureInput} onChange={this.handleFeatureInput.bind(this)} rows="5" placeholder="What feature do you have in mind?"></textarea>
                       </div>
                  </div>
                  <div class="uk-modal-footer uk-text-right">
                      <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                      <button
                        onClick={this.handleFeatureRequest.bind(this)}
                        type="button"
                        disabled={this.state.featureRequestLoading ? true : false}
                        className={"uk-button uk-button-primary"}>
                          {this.state.featureRequestLoading ? "Sending .." : "Send"}
                        </button>
                  </div>
              </div>
          </div>

        </div>
      )
    }
  }
