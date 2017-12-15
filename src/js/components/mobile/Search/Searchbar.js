
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"
  import { push } from 'react-router-redux'

  import ReactTable from 'react-table'

  import { mapStateToProps } from '../../../reducers';
  import { getPriceInPersonalCurrency } from '../../../scripts/convert'

  import { changeFilterTable } from '../../../actions/coinTableActions'

  import { store } from '../../../store'

  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })



  export default class Table extends React.Component {
    constructor(props){
      super(props)
      this.state = {

      }
    }

    handleChange(e){
      this.props.dispatch(changeFilterTable(e.target.value))
    }

    render() {
      const { socket, coin, coinTable, router, config } = this.props

      return (
        <div class="Searchbar">
        <input onChange={this.handleChange.bind(this)} value={coinTable.filtered[0].value} />
        </div>
      )
    }
  }
