
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"
  import { push } from 'react-router-redux'

  import ReactTable from 'react-table'

  import { mapStateToProps } from '../../reducers';
  import { getPriceInPersonalCurrency } from '../../scripts/convert.js'

  import { store } from '../../store'


  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })



  export default class Table extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        columns: [
          {
            Header: "#",
            id: "rank",
            maxWidth: 80,
            accessor: d => Number(d.rank),
          },
          {
            Header: "",
            id: "img",
            maxWidth: 50,
            Cell: row => (
                  <center><span>
                  <img width="24px" src={"https://files.coinmarketcap.com/static/img/coins/32x32/" + row.original.id.toLowerCase() + ".png"} />

                  </span></center>
                ),
          },
          {
            Header: "Name",
            id: "name",
            accessor: d => d.name,
            Cell: row => (
                  <span>
                  <b><font style={{fontSize: '12px'}}>
                    [{row.original.symbol}]
                  </font></b>
                  &nbsp;<b>{row.original.name}</b>

                  </span>
                ),
          },
          {
            Header: "ONLY SORT",
            id: "symbol",
            show: true,
            accessor: d => d.symbol,
            maxWidth: 0,
            filterable: true,
            headerStyle: {'display': 'none'},
            style: {'display': 'none'},
          },
          {
            Header: "Price",
            id: "price_usd",
            maxWidth: 150,
            accessor: d => Number(d.price_usd),
            Cell: row => (
                  <span>
                    <b>{this.props.config.currency_symbol + getPriceInPersonalCurrency(row.value, this.props.config.currency)}</b>
                  </span>
                ),
          },
          {
            Header: "Market Cap",
            id: "market_cap_usd",
            maxWidth: 200,
            accessor: d => Number(d.market_cap_usd),
            Cell: row => (
                  <span>
                    {this.props.config.currency_symbol + getPriceInPersonalCurrency(row.value, this.props.config.currency)}
                  </span>
                ),
          },
          {
            Header: "24h Volume",
            id: "24h_volume_usd",
            maxWidth: 200,
            accessor: d => Number(d['24h_volume_usd']),
            Cell: row => (
                  <span>
                    {this.props.config.currency_symbol + getPriceInPersonalCurrency(row.value, this.props.config.currency)}
                  </span>
                ),
          },
          {
            Header: "Gain 7d",
            id: "percent_change_7d",
            maxWidth: 100,
            accessor: d => Number(d['percent_change_7d']),
            Cell: row => (
                  <span style={row.value > 0 ? {color: 'green'} : {color: 'red'}}>
                    {row.value > 0 ? '+' + row.value.toLocaleString() : row.value.toLocaleString()}%
                  </span>
                ),

          },
          {
            Header: "Gain 24h",
            id: "percent_change_24h",
            maxWidth: 100,
            accessor: d => Number(d['percent_change_24h']),
            Cell: row => (
                  <span style={row.value > 0 ? {color: 'green'} : {color: 'red'}}>
                    {row.value > 0 ? '+' + row.value.toLocaleString() : row.value.toLocaleString()}%
                  </span>
                ),

          },

        ]

      }
    }
    render() {
      const { socket, coin, coinTable, router, config } = this.props

      return (
        <div class="table uk-container">

          <ReactTable
            data={coin}
            columns={this.state.columns}
            defaultPageSize={config.coinTableSize}
            filtered={coinTable.filtered}
            defaultFilterMethod= {(filter, row, column) => {
              return row['symbol'].toLowerCase().startsWith(filter.value.toLowerCase()) || row['name'].toLowerCase().startsWith(filter.value.toLowerCase())
            }}


            pageSize={ typeof router.location.state === "undefined" ? config.coinTableSize : router.location.state.tableSize }
            page={ typeof router.location.state === "undefined" ? 0 : router.location.state.tablePage }

            onPageChange={(index) => {
              let state = router.location.state
              store.dispatch(push({ pathname: '/',  state: {...state, tablePage: index} }))
            }}

            onPageSizeChange={(size) => {
              let state = router.location.state
              store.dispatch(push({ pathname: '/',  state: {...state, tableSize: size} }))
            }}

            onSortedChange={() => {
              let state = router.location.state
              store.dispatch(push({pathname:'/', state: {...state, tablePage: 0}}))
            }}

            getTdProps={(state, rowInfo, column, instance) => {
            return {
              onClick: (e, handleOriginal) => {
                store.dispatch(push('/coin/'+ rowInfo.original.id.toLowerCase()))
                if (handleOriginal) {
                  handleOriginal()
                }
              }
            }
            }}
          />

          <br/><br/><br/>

        </div>
      )
    }
  }
