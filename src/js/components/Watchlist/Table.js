
  import React from "react";
  import UIkit from 'uikit';
  import { NavLink } from 'react-router-dom'
  import { connect } from "react-redux"
  import { push } from 'react-router-redux'

  import ReactTable from 'react-table'

  import { mapStateToProps } from '../../reducers';
  import { getPriceInPersonalCurrency } from '../../scripts/convert.js'

  import { addWatchlist, deleteFromWatchlist } from '../../actions/authActions'

  import { store } from '../../store'


  // Redux Store setup
  @connect((store) => {
    return mapStateToProps(store)
  })



  export default class Table extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        selectedData: [],
        pageSize: 5,
      }
    }

    render() {
      const { socket, coin, coinTable, router, config, auth } = this.props

      let columns = [
        {
          Header: row => (<center><i class="fa fa-star favorite-header"></i></center>),
          id: "fav",
          maxWidth: 50,
          Cell: row => (
                <center>
                  {auth.user.watchlist.indexOf(row.original.id) === -1 ? (
                    <i class="fa fa-star-o favorite"></i>
                  ) : (
                    <i class="fa fa-star favorite"></i>
                  )}
                </center>
              ),
        },
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

      let coinData

      if(auth.authenticated){
        let pageSize = auth.user.watchlist.length < 50 ? auth.user.watchlist.length : 50
        if(pageSize !== this.state.pageSize){
          this.setState({
            pageSize
          })
        }
        coinData = coin.filter((c) => {
          if(auth.user.watchlist.indexOf(c.id) != -1){
            return true
          }
        })
      }

      return (
        <div class="table uk-container">

          <ReactTable
            data={coinData}
            columns={columns}
            defaultPageSize={this.state.pageSize}
            defaultFilterMethod= {(filter, row, column) => {
              return row['symbol'].toLowerCase().startsWith(filter.value.toLowerCase()) || row['name'].toLowerCase().startsWith(filter.value.toLowerCase())
            }}

            pageSize={this.state.pageSize}

            onPageChange={(index) => {
              let state = router.location.state
              store.dispatch(push({ pathname: '/watchlist',  state: {...state, tablePage: index} }))
            }}

            onPageSizeChange={(size) => {
              let state = router.location.state
              store.dispatch(push({ pathname: '/watchlist',  state: {...state, tableSize: size} }))
            }}

            onSortedChange={() => {
              let state = router.location.state
              store.dispatch(push({pathname:'/watchlist', state: {...state, tablePage: 0}}))
            }}

            getTdProps={(state, rowInfo, column, instance) => {
            return {
              onClick: (e, handleOriginal) => {
                if(column.id === "fav"){
                  let coinID = rowInfo.original.id
                  if(auth.user.watchlist.indexOf(coinID) === -1){
                    store.dispatch(addWatchlist(coinID))
                    socket.socket.emit('addWatchlistEvent', {coinID, userID: auth.user.id})
                  }
                  else{
                    store.dispatch(deleteFromWatchlist(coinID))
                    socket.socket.emit('deleteWatchlistEvent', {coinID, userID: auth.user.id})
                  }
                }
                else{
                  store.dispatch(push('/coin/'+ rowInfo.original.id.toLowerCase()))
                }
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
