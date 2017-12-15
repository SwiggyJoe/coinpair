
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"

  import { withRouter } from 'react-router-dom'

  import Table from './Table'
  import Searchbar from "../Search/Searchbar"

  import { mapStateToProps } from '../../../reducers';

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })

  export default class Coins extends React.Component {
    render() {
      const { socket, coin } = this.props
      return (
        <div class="coins uk-container">
          <Searchbar />
          <Table />
        </div>
      )
    }
  }
