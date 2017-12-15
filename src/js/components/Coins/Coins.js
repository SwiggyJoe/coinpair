
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"

  import { withRouter } from 'react-router-dom'

  import Information from './Information'
  import Right from './Right'
  import Table from './Table'

  import { mapStateToProps } from '../../reducers';

  import { changeFilterTable } from '../../actions/coinTableActions'

  var timer;
  var time;

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Coins extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        styleSymbol : {},
        search: this.props.coinTable.filtered[0].value,
        isSearching: false,
      }
    }

    handleChange(e){

      clearTimeout(timer)

      timer = setTimeout(() => {
        this.props.dispatch(changeFilterTable(this.state.search))
        this.setState({
          isSearching: false,
        })
      },750)

      this.setState({
        search: e.target.value,
        isSearching: true,
      })

    }
    handleClick(e){
      this.setState({
        styleSymbol: {color: 'rgb(72, 72, 79)'}
      })
    }
    handleBlur(e){
      this.setState({
        styleSymbol: {color: '#979797'}
      })
    }
    render() {
      const { socket, coin, coinTable } = this.props
      return (
        <div>

        <div class="alphaLayer">
          <h1>Welcome to the Alpha!</h1>
          <p>It looks like you got access to CoinPair very early.
          This means you have the power to shape the future of this product,
          <b> do not underestimate your worth for CoinPair! </b>
          We need your feedback and bug reports to make CoinPair one of the
          best websites ever. You can find everything on the <b>Updates</b> page.</p><br/>
          <p><b>And of course you will get a nice gift once CoinPair goes public!</b></p>
        </div>

          <div class="coins uk-container">
            <Right />
          </div>

            <div class="splitter"></div>

          <div class="coins uk-container">

            <div class="search">
              <div class="" className={this.state.isSearching ? "activeSearch wrapper" : "wrapper"}>
              <input
                placeholder="Search.."
                type="text"
                className=""
                value={this.state.search}
                onChange={this.handleChange.bind(this)}
                onClick={this.handleClick.bind(this)}
                onBlur={this.handleBlur.bind(this)}
                />
              </div>

              <i class="fa fa-search" style={this.state.styleSymbol}></i>
            </div>

            <br/>
            <Table />
          </div>
        </div>
      )
    }
  }
